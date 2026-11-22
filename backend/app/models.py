from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, UniqueConstraint
from .database import Base

def now(): return datetime.now(timezone.utc)
class Agent(Base):
    __tablename__='agents'
    id=Column(Integer,primary_key=True)
    name=Column(String(120),nullable=False)
    email=Column(String(255),unique=True,nullable=False)
    password_hash=Column(String(255),nullable=False)
class Ticket(Base):
    __tablename__='tickets'
    id=Column(Integer,primary_key=True)
    customer_name=Column(String(120),nullable=False)
    customer_email=Column(String(255),nullable=False)
    subject=Column(String(255),nullable=False)
    description=Column(Text,nullable=False)
    priority=Column(String(20),nullable=False,default='LOW')
    status=Column(String(30),nullable=False,default='OPEN')
    assignee_id=Column(Integer,ForeignKey('agents.id'),nullable=True)
    created_at=Column(DateTime(timezone=True),default=now,nullable=False)
    updated_at=Column(DateTime(timezone=True),default=now,nullable=False)
    first_response_at=Column(DateTime(timezone=True))
    resolved_at=Column(DateTime(timezone=True))
    closed_at=Column(DateTime(timezone=True))
    waiting_since=Column(DateTime(timezone=True))
    response_due_at=Column(DateTime(timezone=True),nullable=False)
    resolution_due_at=Column(DateTime(timezone=True),nullable=False)
    response_remaining_seconds=Column(Integer)
    resolution_remaining_seconds=Column(Integer)
    response_breached=Column(Boolean,default=False,nullable=False)
    resolution_breached=Column(Boolean,default=False,nullable=False)
class Message(Base):
    __tablename__='messages'
    id=Column(Integer,primary_key=True)
    ticket_id=Column(Integer,ForeignKey('tickets.id'),nullable=False)
    actor_id=Column(Integer,ForeignKey('agents.id'))
    body=Column(Text,nullable=False)
    visibility=Column(String(20),nullable=False)
    created_at=Column(DateTime(timezone=True),default=now,nullable=False)
class AuditLog(Base):
    __tablename__='audit_logs'
    id=Column(Integer,primary_key=True)
    ticket_id=Column(Integer,ForeignKey('tickets.id'),nullable=False)
    actor_id=Column(Integer,ForeignKey('agents.id'))
    action=Column(String(80),nullable=False)
    details=Column(Text,nullable=False,default='{}')
    created_at=Column(DateTime(timezone=True),default=now,nullable=False)
class Holiday(Base):
    __tablename__='holidays'
    date=Column(String(10),primary_key=True)
    name=Column(String(120),nullable=False)
