# Frontdesk — Support Ticket Management

Full-stack hiring assessment implementation: React, FastAPI, PostgreSQL.

## Requirements
Python 3.11+, Node 20+, PostgreSQL 14+.

## Backend setup
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # On Windows copy manually
```
Create PostgreSQL database `frontdesk`. Edit `.env` with your PostgreSQL connection, a strong SECRET_KEY and allowed frontend URL.

Seed demo agent (choose your own strong password):
```bash
# PowerShell: $env:SEED_PASSWORD="your-password"
# Bash: export SEED_PASSWORD="your-password"
python seed.py
uvicorn app.main:app --reload
```
API docs: http://localhost:8000/docs

## Frontend setup
```bash
cd frontend
npm install
# Copy .env.example to .env
npm run dev
```
Open http://localhost:5173 and sign in with the seeded email and password.

## Deployment
1. Provision a managed PostgreSQL database.
2. On Render create a Python Web Service rooted at `backend`, build command `pip install -r requirements.txt`, start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Set `DATABASE_URL`, `SECRET_KEY`, `CORS_ORIGINS` and `TIMEZONE` on Render. Use the provider's supported PostgreSQL URL.
4. Create the agent by running `python seed.py` in a secure shell with `SEED_PASSWORD` set. Do not commit credentials. If the host has no shell, seed locally against the hosted DB using a secure connection.
5. On Vercel deploy `frontend` with build command `npm run build`, output directory `dist`, environment variable `VITE_API_URL=https://YOUR-BACKEND.onrender.com`.
6. Update Render `CORS_ORIGINS` to the exact deployed Vercel origin and redeploy. Verify `/health`, sign in and create a ticket.
7. Ensure hosting remains active for seven days after submission; free services may sleep.

## Business-rule decisions
- Working calendar: Monday–Friday, 09:30–18:30, Asia/Kolkata; holidays read from `holidays` table (populate real holiday dates before evaluation).
- Medium response: 4.5 working hours; medium resolution: 27 working hours; low response: 9 working hours; low resolution: 45 working hours.
- Urgent resolution: end of the current/next working day. Urgent response: 2 working hours.
- Changing priority restarts the SLA budget at the moment of change; logged in history.
- Waiting on customer pauses both SLA timers. Customer reply resumes remaining budget.
- Stale waiting tickets close after 45 working hours (five working days) when maintenance is invoked.
- Reopening allowed for five working days after resolution; a reopened ticket gets one working day to resolve (implementation assumption).
- Claim uses a conditional atomic SQL UPDATE, returning HTTP 409 on a conflict.
- Customer-facing message projection includes PUBLIC messages only. The endpoint is agent-authenticated; customer authentication is not implemented.
- Audit log is append-only through the application API; DB administrators still have database-level modification powers.

## Known limitations / completion note
- Automatic closure currently requires calling `POST /api/maintenance/close-stale` as an authenticated agent; configure an authenticated scheduler for production automation.
- No outbound email or independent customer portal; public replies are recorded in the system, not emailed.
- No holiday management UI: holidays can be inserted into PostgreSQL `holidays` table.
- No migrations, automated test suite, pagination beyond first 500 tickets, or granular admin roles.
- SLA breach flags are evaluated on reads, and historical breach evidence is persisted for some transitions; a full immutable SLA event ledger is not implemented.
- Demo customer reply entry is agent-operated and does not verify a customer identity.

## Assessment submission
Provide live URL, GitHub repo URL, this README and a truthful completion note describing unfinished work.
