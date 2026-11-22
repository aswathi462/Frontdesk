import os
from dotenv import load_dotenv
load_dotenv()
from app.database import Base,engine,SessionLocal
from app.models import Agent,Holiday
from app.auth import hash_password
Base.metadata.create_all(engine)
with SessionLocal() as db:
    email=os.getenv('SEED_EMAIL','agent@frontdesk.test')
    password=os.getenv('SEED_PASSWORD')
    if not password:raise SystemExit('Set SEED_PASSWORD before running seed.py')
    if not db.query(Agent).filter_by(email=email).first():
        db.add(Agent(name='Demo Agent',email=email,password_hash=hash_password(password)))
    db.commit()
print('Agent ready:',email)
