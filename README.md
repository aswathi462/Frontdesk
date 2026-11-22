# FRONTDESK – Customer Support Ticket Management System

FRONTDESK is a full-stack web application designed to help support teams manage customer service tickets efficiently.

The system provides a centralized platform where authorized support agents can manage customer issues, track ticket progress, update ticket information, and monitor ticket resolution.

The application is built using **React, FastAPI, and PostgreSQL** and is deployed using **Vercel, Render, and Neon**.

## Live Application

**Frontend:** https://frontdesk-dun.vercel.app

**Backend API:** https://frontdesk-backend-wsx7.onrender.com

**API Health Check:** https://frontdesk-backend-wsx7.onrender.com/health

**GitHub Repository:** https://github.com/aswathi462/Frontdesk

## Features

- Secure support agent login using JWT authentication.
- Centralized ticket management dashboard.
- Create and manage customer support tickets.
- View and track ticket information.
- Update ticket details and statuses.
- Support ticket assignment and resolution workflows.
- Automatic ticket closure checks.
- Persistent ticket storage using PostgreSQL.
- REST API integration between frontend and backend.
- Responsive web interface.

## Technology Stack

### Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- JavaScript

### Backend
- Python
- FastAPI
- SQLAlchemy
- JWT Authentication
- Pydantic

### Database
- PostgreSQL
- Neon PostgreSQL (Cloud)

### Deployment
- Vercel – Frontend hosting
- Render – Backend hosting
- Neon – PostgreSQL database
- GitHub – Source code management

## Project Structure

```text
Frontdesk/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   └── ...
│   ├── requirements.txt
│   ├── seed.py
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## Prerequisites

Before running the project locally, install:

- Python 3.11
- Node.js and npm
- Git
- PostgreSQL (local database or Neon cloud database)
- Visual Studio Code (recommended)

## Installation and Setup

### Step 1: Clone the Repository

Open a terminal and run:

```bash
git clone https://github.com/aswathi462/Frontdesk.git
```

Navigate to the project directory:

```bash
cd Frontdesk
```

### Step 2: Backend Setup

Navigate to the backend folder:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

**Windows Command Prompt:**

```cmd
.venv\Scripts\activate
```

**Windows PowerShell:**

```powershell
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source .venv/bin/activate
```

Install the required Python dependencies:

```bash
pip install -r requirements.txt
```

### Step 3: Configure Backend Environment Variables

Create a `.env` file inside the `backend` folder.

You can copy the provided `.env.example` file.

**Windows:**

```cmd
copy .env.example .env
```

**macOS / Linux:**

```bash
cp .env.example .env
```

Update the `.env` file with your own values:

```env
DATABASE_URL=postgresql+psycopg://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME
SECRET_KEY=your-own-random-secret-key
CORS_ORIGINS=http://localhost:5173
TIMEZONE=Asia/Kolkata
```

**DATABASE_URL:** PostgreSQL connection string. You can use a local PostgreSQL database or a Neon cloud database.

**SECRET_KEY:** Used for signing authentication tokens.

Generate a secure secret key using:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

**CORS_ORIGINS:** Specifies the frontend origin allowed to communicate with the backend.

**TIMEZONE:** Application timezone.

**Important:** Never commit the `.env` file, database passwords, or secret keys to GitHub.

### Step 4: Initialize the Database

Make sure your PostgreSQL database is running and `DATABASE_URL` is correctly configured.

The backend uses SQLAlchemy to create the required database tables during application startup.

Start the backend once to initialize the tables.

### Step 5: Run the Backend

From the `backend` directory, run:

```bash
uvicorn app.main:app --reload
```

The backend will run at:

http://localhost:8000

Test the backend health endpoint:

http://localhost:8000/health

Expected response:

```json
{
  "status": "ok"
}
```

Interactive API documentation is available at:

http://localhost:8000/docs

### Step 6: Create an Agent Account

Open a second terminal inside the `backend` directory and activate the Python virtual environment.

Set the agent email and password.

**Windows Command Prompt:**

```cmd
set SEED_EMAIL=agent@frontdesk.test
set /p SEED_PASSWORD=Enter agent password:
python seed.py
```

**Windows PowerShell:**

```powershell
$env:SEED_EMAIL = "agent@frontdesk.test"
$env:SEED_PASSWORD = Read-Host "Enter agent password"
python seed.py
```

**macOS / Linux:**

```bash
export SEED_EMAIL=agent@frontdesk.test
read -s -p "Enter agent password: " SEED_PASSWORD
echo
export SEED_PASSWORD
python seed.py
```

Expected output:

```text
Agent ready: agent@frontdesk.test
```

The agent account is now available for login.

Keep the password secure.

### Step 7: Frontend Setup

Open a new terminal.

From the project root, navigate to the frontend folder:

```bash
cd frontend
```

Install the frontend dependencies:

```bash
npm install
```

### Step 8: Configure Frontend Environment Variables

Create a `.env` file inside the `frontend` directory.

Add:

```env
VITE_API_URL=http://localhost:8000
```

This connects the React frontend to the locally running FastAPI backend.

### Step 9: Run the Frontend

Start the frontend development server:

```bash
npm run dev
```

Open the URL displayed in the terminal, normally:

http://localhost:5173

The FRONTDESK login page should appear.

## How to Use the Application

### Agent Login

1. Open the FRONTDESK application.
2. Enter the registered agent email.
3. Enter the password configured during account creation.
4. Click **Sign In**.
5. After successful authentication, access the support ticket dashboard.

### Ticket Management

Authorized agents can use the dashboard to work with customer support tickets.

The application supports ticket creation, viewing ticket information, updating ticket details, and managing ticket progress.

### Automatic Ticket Closure

The backend runs a periodic check for tickets eligible for automatic closure according to the application's configured business rules.

The check runs approximately every five minutes while the backend application process is running.

## Live Deployment Details

| Component | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://frontdesk-dun.vercel.app |
| Backend | Render | https://frontdesk-backend-wsx7.onrender.com |
| Database | Neon | PostgreSQL cloud database |
| Source Code | GitHub | https://github.com/aswathi462/Frontdesk |

### Accessing the Deployed Application

1. Open https://frontdesk-dun.vercel.app
2. The agent login page will appear.
3. Enter valid agent credentials.
4. Click **Sign In** to access the dashboard.

**Demo Agent Email:** `agent@frontdesk.test`

**Demo Password:** `FrontDesk@2026#Secure91!`
The application currently uses agent-based authentication. Customers do not have a separate public signup or ticket submission page.

## Deployment Configuration

### Backend Deployment – Render

The backend is deployed as a Python web service.

**Root Directory:**

```text
backend
```

**Build Command:**

```bash
pip install -r requirements.txt
```

**Start Command:**

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

**Environment Variables:**

```env
DATABASE_URL=<your-neon-postgresql-connection-string>
SECRET_KEY=<your-secure-secret-key>
CORS_ORIGINS=https://frontdesk-dun.vercel.app
TIMEZONE=Asia/Kolkata
PYTHON_VERSION=3.11.11
```

### Frontend Deployment – Vercel

The frontend is deployed using Vercel.

**Framework Preset:** Vite

**Root Directory:**

```text
frontend
```

**Install Command:**

```bash
npm install
```

**Build Command:**

```bash
npm run build
```

**Output Directory:**

```text
dist
```

**Environment Variable:**

```env
VITE_API_URL=https://frontdesk-backend-wsx7.onrender.com
```

## API Documentation

FastAPI automatically generates interactive API documentation.

**Local API Docs:**

http://localhost:8000/docs

**Deployed API Docs:**

https://frontdesk-backend-wsx7.onrender.com/docs

These pages allow developers to inspect available API endpoints and their request/response structures.

Protected endpoints require authentication.

## Security

- JWT-based authentication for protected application functionality.
- Password hashing for stored agent credentials.
- Environment variables for sensitive configuration.
- CORS configuration for frontend-backend communication.
- PostgreSQL database connectivity using environment-based credentials.
- Sensitive `.env` files excluded from version control.

## Known Limitations

- The current deployment is focused on agent-based ticket management.
- A separate public customer ticket submission interface is not included.
- Demo credentials must be shared privately.
- Free hosting services may experience startup delays after inactivity.
- The automatic closure check runs within the backend process and depends on the application being active.

## Future Enhancements

- Public customer ticket submission portal.
- Separate customer and agent accounts.
- Customer ticket status tracking.
- Email notifications for ticket updates.
- Advanced ticket analytics and reporting.
- Additional administrative controls.
