# Pareeksha Backend

Student registration API (Node + Express + TypeScript).

## Setup

```bash
cd backend
npm install
```

## Run

**Development** (with auto-reload):

```bash
npm run dev
```

**Production**:

```bash
npm run build
npm start
```

Server runs at **http://localhost:3000** by default. Set `PORT` to change.

## API

### Register a student

`POST /api/students/register`

Request body (JSON) — same shape as frontend form:

- `firstName`, `lastName` (required)
- `email` (required, valid email)
- `dateOfBirth` (required)
- `phone`, `adhaarNumber` (optional; Aadhaar must be 12 digits if provided)
- `schoolName`, `class` (required)
- `course`, `gender` (required)
- `address`, `city`, `state`, `pincode` (required; pincode 6 digits)
- `guardianName` (required), `guardianPhone` (optional)

**Success:** `201` with `{ success: true, student: { id, createdAt, ... } }`  
**Validation error:** `400` with `{ success: false, errors: [{ field, message }] }`

### List students

`GET /api/students`

Returns `{ success: true, students: StudentRecord[] }`.

### Get student by ID

`GET /api/students/:id`

Returns `{ success: true, student }` or `404`.

### Health

`GET /health` → `{ status: 'ok' }`

## Data

Registrations are stored in a **MySQL** database named `student`.

### MySQL setup

1. Create the database (if it doesn't exist):

   ```sql
   CREATE DATABASE student;
   ```

2. Copy `.env.example` to `.env` and set your MySQL credentials:

   ```bash
   cp .env.example .env
   # Edit .env: MYSQL_USER, MYSQL_PASSWORD, etc.
   ```

3. On startup, the server creates the `students` table automatically if it doesn't exist.

Environment variables (see `.env.example`):

- `MYSQL_HOST` (default: localhost)
- `MYSQL_PORT` (default: 3306)
- `MYSQL_USER` (default: root)
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE` (default: student)
