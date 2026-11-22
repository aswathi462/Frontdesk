
from pydantic import BaseModel, Field, EmailStr
from typing import Literal


class LoginIn(BaseModel):
    email: str
    password: str


class TicketIn(BaseModel):
    customer_name: str = Field(min_length=1, max_length=120)
    customer_email: EmailStr
    subject: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    priority: Literal['URGENT', 'MEDIUM', 'LOW'] = 'LOW'


class PriorityIn(BaseModel):
    priority: Literal['URGENT', 'MEDIUM', 'LOW']


class StatusIn(BaseModel):
    status: Literal[
        'OPEN',
        'IN_PROGRESS',
        'WAITING_CUSTOMER',
        'RESOLVED',
        'CLOSED'
    ]


class MessageIn(BaseModel):
    body: str = Field(min_length=1)
    visibility: Literal['PUBLIC', 'INTERNAL']


class CustomerReplyIn(BaseModel):
    body: str = Field(min_length=1)
