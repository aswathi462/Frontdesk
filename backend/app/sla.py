from datetime import datetime,date,time,timedelta,timezone
from zoneinfo import ZoneInfo
import os
from sqlalchemy.orm import Session
from .models import Holiday
TZ=ZoneInfo(os.getenv('TIMEZONE','Asia/Kolkata'))
START=time(9,30);END=time(18,30)
WORKDAY=9*3600

def aware(dt):
    if dt.tzinfo is None:return dt.replace(tzinfo=timezone.utc)
    return dt

def working(dt,holidays):
    local=aware(dt).astimezone(TZ)
    return local.weekday()<5 and local.date().isoformat() not in holidays and START<=local.time()<END

def normalize(dt,holidays):
    dt=aware(dt).astimezone(TZ)
    while True:
        if dt.weekday()>=5 or dt.date().isoformat() in holidays:
            dt=datetime.combine(dt.date()+timedelta(days=1),START,TZ);continue
        if dt.time()<START:dt=datetime.combine(dt.date(),START,TZ)
        if dt.time()>=END:dt=datetime.combine(dt.date()+timedelta(days=1),START,TZ);continue
        return dt

def add_work_seconds(dt,seconds,holidays):
    dt=normalize(dt,holidays);remaining=max(0,int(seconds))
    while remaining:
        end=datetime.combine(dt.date(),END,TZ)
        available=int((end-dt).total_seconds())
        used=min(remaining,available)
        dt+=timedelta(seconds=used);remaining-=used
        if remaining:dt=normalize(dt+timedelta(seconds=1),holidays)
    return dt.astimezone(timezone.utc)

def work_seconds_between(start,end,holidays):
    start=aware(start);end=aware(end)
    if end<=start:return 0
    cursor=normalize(start,holidays)
    seconds=0
    while cursor.astimezone(timezone.utc)<end:
        limit=datetime.combine(cursor.date(),END,TZ).astimezone(timezone.utc)
        chunk=min(limit,end)
        if chunk>cursor.astimezone(timezone.utc):seconds+=int((chunk-cursor.astimezone(timezone.utc)).total_seconds())
        cursor=normalize(limit+timedelta(seconds=1),holidays)
    return seconds

def holidays_for(db:Session):return {h.date for h in db.query(Holiday).all()}

def deadlines(created,priority,holidays):
    response={'URGENT':2*3600,'MEDIUM':WORKDAY//2,'LOW':WORKDAY}[priority]
    if priority=='URGENT':
        local=normalize(created,holidays)
        resolution=datetime.combine(local.date(),END,TZ).astimezone(timezone.utc)
    else:resolution=add_work_seconds(created,{'MEDIUM':3*WORKDAY,'LOW':5*WORKDAY}[priority],holidays)
    return add_work_seconds(created,response,holidays),resolution

def remaining(now,due,holidays):return work_seconds_between(now,due,holidays)
