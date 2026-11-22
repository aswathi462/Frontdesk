import os
from datetime import datetime,timedelta,timezone
from fastapi import Depends,HTTPException
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from jose import jwt,JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from .database import get_db
from .models import Agent
pwd=CryptContext(schemes=['bcrypt'],deprecated='auto')
security=HTTPBearer()
def hash_password(p): return pwd.hash(p)
def verify_password(p,h): return pwd.verify(p,h)
def token(agent):
    secret=os.getenv('SECRET_KEY')
    if not secret: raise RuntimeError('SECRET_KEY must be configured')
    return jwt.encode({'sub':str(agent.id),'exp':datetime.now(timezone.utc)+timedelta(hours=12)},secret,algorithm='HS256')
def current_agent(credentials:HTTPAuthorizationCredentials=Depends(security),db:Session=Depends(get_db)):
    try:
        data=jwt.decode(credentials.credentials,os.environ['SECRET_KEY'],algorithms=['HS256'])
        agent=db.get(Agent,int(data['sub']))
        if agent:return agent
    except (JWTError,ValueError,KeyError):pass
    raise HTTPException(401,'Invalid or expired token')
