# Kidney AI System

---

## Environment Setup

Regardless of which setup method you choose, you must first create a `.env` file in the **root directory** of the project:

```
DATABASE_URL=         # Will be provided separately
SECRET_KEY=           # Any long random string of your choice
ALGORITHM=HS256       # Do not change this value
SUPER_ADMIN_PASSWORD= # Any password of your choice
```

---

## Option 1: Docker Setup (Recommended)

The easiest way to run the project — no need to install Python, Node.js, or Angular CLI.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

### Steps

1. Make sure Docker Desktop is running
2. In the root directory, run:

```bash
docker-compose up --build
```

> The first run may take several minutes while Docker downloads and builds everything. Subsequent runs will be much faster.

### Access the app


| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Main Portal | http://localhost:4200 |
| Admin Portal | http://localhost:4201 |

### To stop the app

Press `Ctrl + C` in the terminal.

---

## Option 2: Manual Setup

### Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| [Python](https://www.python.org/downloads/release/python-3119/) | 3.11 | Check "Add Python to PATH" during install |
| [Node.js](https://nodejs.org/) | Latest LTS | npm is included |
| [Angular CLI](https://angular.io/cli) | Latest | Run `npm install -g @angular/cli` after Node |

### Backend

Open a terminal in the **root directory** and run:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Runs on `http://localhost:8000` — API docs at `http://localhost:8000/docs`

### Frontend

Open a **separate terminal** for each portal:

**Main Portal:**
```bash
cd frontend/kidney_ai_system
npm install
ng serve --no-hmr
```
Runs on `http://localhost:4200`

**Admin Portal:**
```bash
cd frontend/kidney_ai_system_admin
npm install
ng serve --no-hmr
```
Runs on a port automatically assigned by Angular (shown in terminal output).

### Running Order

Always start services in this order:

```
1. Backend        →   uvicorn backend.main:app --reload
2. Main Portal    →   ng serve --no-hmr  (inside kidney_ai_system)
3. Admin Portal   →   ng serve --no-hmr  (inside kidney_ai_system_admin)
```

---

## Notes

- No PostgreSQL or pgAdmin installation needed — the database is hosted online
- Do not modify the `ALGORITHM` value in the `.env` file
- For any code changes, create a new branch and open a Pull Request on GitHub
