# Pareeksha

Student Registration — React frontend + Node backend.

## Quick start (backend + frontend)

**1. Start the backend** (API on port 3000):

```bash
cd backend
npm install
npm run dev
```

**2. Start the frontend** (app on port 5173):

```bash
cd frontend
npm install
npm run dev
```

**3. Open** [http://localhost:5173](http://localhost:5173). Submit the registration form; data is sent to the backend and stored (MySQL if connected, otherwise `backend/data/students.json`).

## How they connect

- In **development**, the frontend (Vite) proxies `/api` to `http://localhost:3000`, so the form `POST /api/students/register` hits the backend with no CORS setup.
- The frontend uses `registerStudent(formData)` in `frontend/src/api/students.ts` and shows loading, success, or validation/network errors.
- For **production**, set `VITE_API_URL` to your backend base URL before building the frontend (see `frontend/.env.example`).

## Project layout

- **frontend/** — Vite + React + TypeScript, 3-step registration form
- **backend/** — Express + TypeScript, `POST /api/students/register`, `GET /api/students`, MySQL or file store

See `backend/README.md` for API details and MySQL configuration.
