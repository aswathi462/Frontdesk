import json
from datetime import datetime,timedelta,timezone
from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy import update,or_
from sqlalchemy.orm import Session
from .database import get_db
from .models import Ticket,Agent,Message,AuditLog,now
from .schemas import LoginIn,TicketIn,PriorityIn,StatusIn,MessageIn,CustomerReplyIn
from .auth import current_agent,verify_password,token
from .sla import deadlines,holidays_for,remaining,add_work_seconds,WORKDAY
router=APIRouter(prefix='/api')

def log(db,ticket,agent,action,details=None):
    db.add(AuditLog(ticket_id=ticket.id,actor_id=agent.id if agent else None,action=action,details=json.dumps(details or {})))
def get_ticket(db,id):
    t=db.get(Ticket,id)
    if not t:raise HTTPException(404,'Ticket not found')
    return t
def is_late(t,holidays):
    current=now()
    response=(t.response_breached or (not t.first_response_at and t.status not in ('WAITING_CUSTOMER','CLOSED') and current>t.response_due_at))
    resolution=(t.resolution_breached or (t.status not in ('WAITING_CUSTOMER','RESOLVED','CLOSED') and current>t.resolution_due_at))
    return response,resolution
def ticket_json(t,holidays):
    r,s=is_late(t,holidays)
    return {k:getattr(t,k) for k in ('id','customer_name','customer_email','subject','description','priority','status','assignee_id','created_at','updated_at','first_response_at','resolved_at','closed_at','waiting_since','response_due_at','resolution_due_at')}|{'response_overdue':r,'resolution_overdue':s}
def require_owner(t,agent):
    if t.assignee_id!=agent.id:raise HTTPException(403,'Claim this ticket before changing it')

@router.post('/login')
def login(data:LoginIn,db:Session=Depends(get_db)):
    a=db.query(Agent).filter(Agent.email==data.email).first()
    if not a or not verify_password(data.password,a.password_hash):raise HTTPException(401,'Invalid credentials')
    return {'access_token':token(a),'agent':{'id':a.id,'name':a.name,'email':a.email}}
@router.get('/me')
def me(a:Agent=Depends(current_agent)):return {'id':a.id,'name':a.name,'email':a.email}
@router.get('/tickets')
def tickets(status:str|None=None,priority:str|None=None,mine:bool=False,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    q=db.query(Ticket)
    if status:q=q.filter(Ticket.status==status)
    if priority:q=q.filter(Ticket.priority==priority)
    if mine:q=q.filter(Ticket.assignee_id==a.id)
    h=holidays_for(db)
    return [ticket_json(t,h) for t in q.order_by(Ticket.created_at.desc()).limit(500)]
@router.post('/tickets',status_code=201)
def create(data:TicketIn,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    h=holidays_for(db);created=now();rd,sd=deadlines(created,data.priority,h)
    t=Ticket(**data.model_dump(),created_at=created,updated_at=created,response_due_at=rd,resolution_due_at=sd)
    db.add(t);db.flush();log(db,t,a,'CREATED',{'priority':t.priority});db.commit();db.refresh(t)
    return ticket_json(t,h)
@router.get('/tickets/{id}')
def detail(id:int,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    t=get_ticket(db,id);h=holidays_for(db)
    msgs=db.query(Message).filter(Message.ticket_id==id).order_by(Message.id).all()
    events=db.query(AuditLog).filter(AuditLog.ticket_id==id).order_by(AuditLog.id).all()
    return {'ticket':ticket_json(t,h),'messages':[{'id':m.id,'body':m.body,'visibility':m.visibility,'actor_id':m.actor_id,'created_at':m.created_at} for m in msgs], 'history':[{'id':e.id,'actor_id':e.actor_id,'action':e.action,'details':json.loads(e.details),'created_at':e.created_at} for e in events]}
@router.post('/tickets/{id}/claim')
def claim(id:int,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    # Conditional UPDATE ensures two concurrent agents cannot both claim.
    result=db.execute(update(Ticket).where(Ticket.id==id,Ticket.assignee_id.is_(None),Ticket.status.notin_(['CLOSED','RESOLVED'])).values(assignee_id=a.id,status='IN_PROGRESS',updated_at=now()))
    if result.rowcount!=1:db.rollback();raise HTTPException(409,'Already assigned or not claimable')
    t=get_ticket(db,id);log(db,t,a,'CLAIMED');db.commit();return {'ok':True}
@router.patch('/tickets/{id}/priority')
def priority(id:int,data:PriorityIn,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    t=get_ticket(db,id);require_owner(t,a)
    if t.status in ('CLOSED','RESOLVED'):raise HTTPException(400,'Cannot reprioritize completed ticket')
    old=t.priority;t.priority=data.priority
    # Documented decision: restart remaining SLA budget from change time.
    h=holidays_for(db);rd,sd=deadlines(now(),data.priority,h)
    if not t.first_response_at:t.response_due_at=rd;t.response_breached=False
    t.resolution_due_at=sd;t.resolution_breached=False
    if t.status=='WAITING_CUSTOMER':
        t.response_remaining_seconds=remaining(now(),rd,h) if not t.first_response_at else None
        t.resolution_remaining_seconds=remaining(now(),sd,h)
    t.updated_at=now();log(db,t,a,'PRIORITY_CHANGED',{'from':old,'to':data.priority,'policy':'restart from change time'});db.commit();return {'ok':True}
@router.patch('/tickets/{id}/status')
def status(id:int,data:StatusIn,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    t=get_ticket(db,id);require_owner(t,a);old=t.status;new=data.status;current=now();h=holidays_for(db)
    allowed={'OPEN':{'IN_PROGRESS','WAITING_CUSTOMER','RESOLVED'},'IN_PROGRESS':{'OPEN','WAITING_CUSTOMER','RESOLVED'},'WAITING_CUSTOMER':{'IN_PROGRESS','RESOLVED'},'RESOLVED':{'OPEN','CLOSED'},'CLOSED':set()}
    if new not in allowed[old]:raise HTTPException(400,'Invalid status transition')
    if old=='RESOLVED' and new=='OPEN':
        if current>add_work_seconds(t.resolved_at,5*WORKDAY,h):raise HTTPException(400,'Reopen window expired; create a new ticket')
        t.resolved_at=None;t.closed_at=None
        t.resolution_due_at=add_work_seconds(current,WORKDAY,h)
    if new=='WAITING_CUSTOMER':
        t.response_breached=t.response_breached or (not t.first_response_at and current>t.response_due_at)
        t.resolution_breached=t.resolution_breached or current>t.resolution_due_at
        t.response_remaining_seconds=remaining(current,t.response_due_at,h) if not t.first_response_at else None
        t.resolution_remaining_seconds=remaining(current,t.resolution_due_at,h)
        t.waiting_since=current
    if old=='WAITING_CUSTOMER':
        if not t.first_response_at and t.response_remaining_seconds is not None:t.response_due_at=add_work_seconds(current,t.response_remaining_seconds,h)
        if t.resolution_remaining_seconds is not None:t.resolution_due_at=add_work_seconds(current,t.resolution_remaining_seconds,h)
        t.waiting_since=None;t.response_remaining_seconds=None;t.resolution_remaining_seconds=None
    if new=='RESOLVED':
        t.resolution_breached=t.resolution_breached or current>t.resolution_due_at;t.resolved_at=current
    if new=='CLOSED':t.closed_at=current
    t.status=new;t.updated_at=current;log(db,t,a,'STATUS_CHANGED',{'from':old,'to':new});db.commit();return {'ok':True}
@router.post('/tickets/{id}/messages')
def message(id:int,data:MessageIn,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    t=get_ticket(db,id);require_owner(t,a)
    if t.status in ('RESOLVED','CLOSED'):raise HTTPException(400,'Reopen before replying')
    current=now();h=holidays_for(db)
    if data.visibility=='PUBLIC' and not t.first_response_at:
        t.response_breached=current>t.response_due_at;t.first_response_at=current
    db.add(Message(ticket_id=id,actor_id=a.id,body=data.body,visibility=data.visibility,created_at=current))
    t.updated_at=current;log(db,t,a,'MESSAGE_ADDED',{'visibility':data.visibility})
    db.commit();return {'ok':True}
# Customer-facing endpoint: no internal notes, no internal audit details.
# A production customer portal must additionally authenticate the ticket owner.
@router.get('/customer/tickets/{id}/messages')
def customer_messages(id:int,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    get_ticket(db,id)
    msgs=db.query(Message).filter(Message.ticket_id==id,Message.visibility=='PUBLIC').order_by(Message.id).all()
    return [{'id':m.id,'body':m.body,'created_at':m.created_at} for m in msgs]
@router.post('/tickets/{id}/customer-reply')
def customer_reply(id:int,data:CustomerReplyIn,db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    # Agent-entered simulation of incoming customer reply, NOT a public customer API.
    t=get_ticket(db,id);current=now();h=holidays_for(db)
    if t.status=='CLOSED':raise HTTPException(400,'Closed ticket requires a new ticket')
    if t.status=='WAITING_CUSTOMER':
        if not t.first_response_at and t.response_remaining_seconds is not None:t.response_due_at=add_work_seconds(current,t.response_remaining_seconds,h)
        if t.resolution_remaining_seconds is not None:t.resolution_due_at=add_work_seconds(current,t.resolution_remaining_seconds,h)
        t.status='IN_PROGRESS';t.waiting_since=None;t.response_remaining_seconds=None;t.resolution_remaining_seconds=None
    db.add(Message(ticket_id=id,actor_id=None,body=data.body,visibility='PUBLIC',created_at=current))
    t.updated_at=current;log(db,t,a,'CUSTOMER_REPLY_RECORDED');db.commit();return {'ok':True}
@router.post('/maintenance/close-stale')
def close_stale(db:Session=Depends(get_db),a:Agent=Depends(current_agent)):
    h=holidays_for(db);current=now();count=0
    for t in db.query(Ticket).filter(Ticket.status=='WAITING_CUSTOMER').all():
        if t.waiting_since and current>=add_work_seconds(t.waiting_since,5*WORKDAY,h):
            t.status='CLOSED';t.closed_at=current;t.updated_at=current;log(db,t,None,'AUTO_CLOSED',{'reason':'No customer reply for five working days'});count+=1
    db.commit();return {'closed':count}
