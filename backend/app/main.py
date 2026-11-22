

import os
import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from .database import Base, engine
from . import models
from .routes import router, log
from .models import Ticket, now
from .sla import holidays_for, add_work_seconds, WORKDAY

logger = logging.getLogger(__name__)


def close_stale_tickets():
    """Close tickets waiting for 5 working days."""
    with Session(engine) as db:
        # Only one PostgreSQL scheduler instance may perform this check at once.
        if db.bind.dialect.name == "postgresql":
            acquired = db.execute(
                text("SELECT pg_try_advisory_xact_lock(20261122)")
            ).scalar()
            if not acquired:
                return 0

        current = now()
        holidays = holidays_for(db)
        count = 0

        tickets = db.query(Ticket).filter(
            Ticket.status == "WAITING_CUSTOMER"
        ).with_for_update().all()

        for ticket in tickets:
            if (
                ticket.waiting_since
                and current >= add_work_seconds(
                    ticket.waiting_since,
                    5 * WORKDAY,
                    holidays
                )
            ):
                ticket.status = "CLOSED"
                ticket.closed_at = current
                ticket.updated_at = current

                log(
                    db,
                    ticket,
                    None,
                    "AUTO_CLOSED",
                    {
                        "reason": "No customer reply for five working days"
                    }
                )

                count += 1

        db.commit()
        return count


async def automatic_closure_job():
    """Check for stale tickets every 5 minutes."""
    while True:
        try:
            count = await asyncio.to_thread(close_stale_tickets)
            print(f"Automatic closure check completed. Tickets closed: {count}")
            if count:
                logger.info("Automatically closed %s tickets", count)

        except Exception:
            logger.exception("Automatic ticket closure failed")

        await asyncio.sleep(300)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)

    task = asyncio.create_task(automatic_closure_job())

    try:
        yield
    finally:
        task.cancel()

        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(
    title="Frontdesk API",
    lifespan=lifespan
)

origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok"}
