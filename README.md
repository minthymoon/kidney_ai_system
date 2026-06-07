# Kidney AI System

---

## Before You Begin

You should have received a **parent folder** containing the following:

```
 Parent Folder
   kidney_ai_system-main       This is the project folder
   model.weights.h5            AI model weights file
   credentials.txt             Database URL and test account credentials are in this file
   documentation.pdf
```

### Required: Place the model weights file

Before doing anything else, take `model.weights.h5` from the parent folder and place it inside the project's `backend/` folder:

```
kidney_ai_system-main/
  backend/
    model.weights.h5       Place it here
```

---

## Required: Create the .env File

**This step must be done regardless of whether you use Docker or Manual setup.**

Create a file named `.env` in the **root directory** of the project (inside `kidney_ai_system-main/`):

```
kidney_ai_system-main/
 .env                     Create it here
```

Fill it in as follows:

```
DATABASE_URL=         # Found in credentials.txt (in the parent folder)
SECRET_KEY=           # Any long random string of your choice
ALGORITHM=HS256       # Do not change this value
SUPER_ADMIN_PASSWORD= # Found in credentials.txt (in the parent folder)
```

---

## Option 1: Docker Setup (Recommended)

The easiest way to run the project: no need to install Python, Node.js, or Angular CLI separately.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) — install and make sure it is open and running before proceeding

### Steps

1. Make sure you have placed `model.weights.h5` inside `backend/` *(see above)*
2. Make sure you have created the `.env` file *(see above)*
3. Open Docker Desktop and wait until it is fully running
4. Open a terminal in the **root directory** of the project (`kidney_ai_system-main/`)
5. Run:

```bash
docker-compose up --build
```

> The first run will take 10 to 20 minutes, may vary depending on device and internet, while Docker downloads and installs all dependencies. This is normal. Subsequent runs will be much faster.

6. Wait until you see all services say **"Started"** in the terminal before opening the app

### Access the app


| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Main Portal | http://localhost:4200 |      # Open this first
| Admin Portal | http://localhost:4201 |     # Open this second

### To stop the app

Press `Ctrl + C` in the terminal, then run:

```bash
docker-compose down
```

### If you need a clean restart

If something goes wrong or you want to start completely fresh:

```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

> This will delete all cached Docker data and rebuild everything from scratch.

---

## Option 2: Manual Setup

### Prerequisites


| [Python](https://www.python.org/downloads/release/python-3119/) | 3.11 | Check "Add Python to PATH" during install |
| [Node.js](https://nodejs.org/) | Latest LTS | npm is included |
| [Angular CLI](https://angular.io/cli) | Latest | Run `npm install -g @angular/cli` after Node |

### Steps

1. Make sure you have placed `model.weights.h5` inside `backend/` *(see above)*
2. Make sure you have created the `.env` file *(see above)*

### Running Order

Always start services in this order — each in its own terminal:

**1. Backend** — open a terminal in the root directory:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Runs on `http://localhost:8000` — API docs at `http://localhost:8000/docs`

**2. Main Portal** — open a second terminal:

```bash
cd frontend/kidney_ai_system
npm install
ng serve --no-hmr
```

Runs on `http://localhost:4200`

**3. Admin Portal** — open a third terminal:

```bash
cd frontend/kidney_ai_system_admin
npm install
ng serve --no-hmr
```

Runs on a port automatically assigned by Angular (shown in terminal output).

---

## Notes

- No PostgreSQL or pgAdmin installation needed — the database is hosted online
- Do not modify the `ALGORITHM` value in the `.env` file
- The `SUPER_ADMIN_PASSWORD` in `.env` does not affect the existing superadmin account in the database
- For any code changes, create a new branch and open a Pull Request on GitHub
