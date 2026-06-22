# Rack Tracker v2

> Extends v1 with JWT auth, Casbin RBAC, PDF uploads, and a cron scheduler with warnings.

![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![Casbin](https://img.shields.io/badge/Casbin_RBAC-5849A6?style=flat&logo=casbin&logoColor=white)
![MailHog](https://img.shields.io/badge/MailHog-1A80B6?style=flat&logo=maildotru&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)
---

## Features added in v2

* **Authentication** – httpOnly JWT cookies with login, logout, and `/api/auth/me` endpoint.
* **Authorization** – Casbin RBAC with 3 predefined roles and a deny-by-default policy.
* **File Uploads** – Multer-based PDF uploads with a 5 MB file size limit and UUID-generated filenames.
* **Scheduler** – `node-cron` powered background jobs for empty-rack monitoring with hot-reload support.
* **Email Alerts** – MailHog SMTP integration that sends warning emails during each scheduler run.
* **Rate Limiting** – Restricts login attempts to **10 requests per 15 minutes** per client.


## Quick Start

### Prerequisites
- Docker >= 24.0
- Docker Compose >= 2.20

```bash
# 1. First clone the repository
git clone https://github.com/RADshahmat/Rack-Tracker.git
cd rack-tracker

# Switch to the v2-security-features version branch
git switch v2-security-features

# 2. Environment setup
cp .env.example .env

# 3. Start everything
docker compose up
```
Once the application is up, you can access the running services at the following local URLs:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health Check | http://localhost:3000/healthz |
| MailHog UI | http://localhost:8025 |

---

## Seeded Users 
Go to the frontend and login with a credential.

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password123` | Full access |
| `operator` | `password123` | No delete |
| `viewer` | `password123` | Read only |

### One-command login check (curl)

```bash
# Open command prompt in windows and Login as admin
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"password123\"}"

# Access protected route
curl -b cookies.txt http://localhost:3000/api/racks

# Logout
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

---

<details>
<summary><span style="font-size: 1.5em; font-weight: bold;">Project Structure</span></summary>

## Project Structure

```
rack-tracker/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── racks/              # controller, service, repository, schema, types
│   │   │   ├── equipment/          # controller, service, repository, schema, types
│   │   │   ├── auth/               # controller, service, repository, schema, types
│   │   │   └── warnings/           # repository, types
│   │   ├── routes/
│   │   │   ├── index.ts            # Central router
│   │   │   ├── rack.routes.ts
│   │   │   ├── equipment.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── warning.routes.ts
│   │   │   └── admin.routes.ts
│   │   ├── middleware/
│   │   │   ├── authMiddleware.ts   # JWT cookie verification → 401
│   │   │   ├── casbinMiddleware.ts # Role permission check → 403
│   │   │   └── uploadMiddleware.ts # Multer PDF config
│   │   ├── casbin/
│   │   │   ├── enforcer.ts         # Casbin init + checkPermission
│   │   │   ├── model.conf          # Casbin model definition
│   │   │   └── policy.csv          # Role-based permissions
│   │   ├── scheduler/
│   │   │   ├── cronScheduler.ts    # Stoppable + restartable cron class
│   │   │   └── mailer.ts           # Nodemailer + MailHog
│   │   ├── shared/
│   │   │   ├── db.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── logger.ts
│   │   │   └── sanitizer.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── racks/
│   │   │   ├── equipment/
│   │   │   ├── warnings/
│   │   │   └── scheduler/
│   │   ├── shared/
│   │   │   ├── api/                # client.ts, queryKeys.ts
│   │   │   ├── components/         # Layout.tsx
│   │   │   └── types/
│   │   ├── components/ui/          # shadcn/ui components
│   │   └── App.tsx
│   ├── Dockerfile
│   └── .env.example
├── db/
│   ├── 01-schema.sql               # Tables + triggers + indexes
│   ├── 02-seed.sql                 # Sample racks + equipment
│   └── 03-users.sql                # Seeded users (all roles)
├── uploads/                        # PDF attachments (Docker volume)
├── docker-compose.yaml
└── README.md
```

---
</details>

<details>
<summary><span style="font-size: 1.5em; font-weight: bold;">Architecture</span></summary>

## Architecture

```
Frontend (React 19 + TanStack Query)
        ↕ HTTP REST + httpOnly Cookie
Backend (Express 5 + TypeScript)
  cookieParser → authMiddleware → casbinMiddleware
  Controller → Service → Repository
        ↕ Parameterized SQL
Database (PostgreSQL 16)

CronScheduler (node-cron)
  every 5min → findEmptyRacks → writeWarnings → sendEmail (MailHog)
```

**Hard rules:**
- SQL lives **only** in repositories
- JWT lives **only** in httpOnly cookies — never localStorage
- Casbin **denies by default** — explicit allow only
- Multer filenames are **always UUID** — never user-supplied

---
</details>

<details>
<summary><span style="font-size: 1.5em; font-weight: bold;">Tech Stack</span></summary>

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 19 + Vite |
| **Data Fetching** | TanStack Query v5 |
| **UI Components** | shadcn/ui + Radix UI |
| **Styling** | Tailwind CSS v4 |
| **HTTP Client** | Axios |
| **Routing** | React Router v6 |
| **Backend Framework** | Express 5 |
| **Language** | TypeScript 5.5 |
| **Database** | PostgreSQL 16 |
| **Validation** | Zod 3.23 |
| **Auth** | JWT + bcryptjs |
| **Authorization** | Casbin v5 |
| **File Uploads** | Multer + UUID |
| **Scheduler** | node-cron |
| **Email** | Nodemailer + MailHog |
| **Containerization** | Docker + Docker Compose |

---
</details>

<details>
<summary><span style="font-size: 1.5em; font-weight: bold;">API Reference</span></summary>

## API Reference

### Auth (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → sets httpOnly cookie |
| POST | `/api/auth/logout` | Logout → clears cookie |
| GET | `/api/auth/me` | Get current user |

### Racks (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/racks` | List all racks |
| GET | `/api/racks/:id` | Get single rack |
| GET | `/api/racks/:id/slots` | Get slot availability |
| GET | `/api/racks/:id/attachments` | List PDF attachments |
| POST | `/api/racks` | Create rack |
| POST | `/api/racks/:id/upload` | Upload PDF (operator+) |
| PUT | `/api/racks/:id` | Update rack |
| DELETE | `/api/racks/:id` | Delete rack (admin only) |
| DELETE | `/api/racks/:id/attachments/:attachmentId` | Delete attachment (admin only) |

### Equipment (Protected)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/equipment?page=1&limit=10` | List equipment (paginated) |
| GET | `/api/equipment/:id` | Get single equipment |
| GET | `/api/equipment/rack/:rackId` | Get equipment by rack |
| POST | `/api/equipment` | Create equipment |
| PUT | `/api/equipment/:id` | Update equipment |
| DELETE | `/api/equipment/:id` | Delete equipment (admin only) |

### Warnings (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/warnings` | List all warnings |
| GET | `/api/warnings/unresolved` | List unresolved warnings |
| PATCH | `/api/warnings/:id/resolve` | Mark warning resolved |

### Admin (Admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/cron-status` | Get scheduler status |
| GET | `/admin/restart-cron` | Restart scheduler |
| GET | `/admin/restart-cron?expression=*/10 * * * *` | Restart with new expression |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthz` | Service + DB health check |

---
</details>

<details>
<summary><span style="font-size: 1.5em; font-weight: bold;">Database Schema</span></summary>

## Database Schema

```sql
-- Users
id, username (unique), email (unique), password (bcrypt),
role (admin|operator|viewer), created_at, updated_at

-- Racks
id, tag (unique), name, location, capacity,
created_at, updated_at (auto via trigger)

-- Equipment
id, tag (unique), name, type,
rack_id (FK → racks, SET NULL on delete),
slot_position, created_at, updated_at (auto via trigger)

-- Rack Attachments
id, rack_id (FK → racks, CASCADE),
filename (UUID on disk), original_name,
file_path, file_size,
uploaded_by (FK → users), created_at

-- Warnings (cron-written)
id, rack_id (FK → racks, CASCADE),
rack_tag, message, resolved,
emailed, created_at
```

---
</details>

<details>
<summary><span style="font-size: 1.5em; font-weight: bold;">Environment Variables</span></summary>

## Environment Variables

Create a `.env` file in the project root and configure the following variables:

| Variable            | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `POSTGRES_USER`     | PostgreSQL username                                          |
| `POSTGRES_PASSWORD` | PostgreSQL password                                          |
| `POSTGRES_DB`       | PostgreSQL database name                                     |
| `DATABASE_URL`      | PostgreSQL connection string                                 |
| `PORT`              | Backend server port                                          |
| `NODE_ENV`          | Application running mode (`development`, `production`, etc.) |
| `CORS_ORIGIN`       | Frontend application URL allowed by CORS                     |
| `JWT_SECRET`        | Secret key used to sign JWT tokens                           |
| `JWT_EXPIRES_IN`    | JWT token expiration time (e.g., `7d`)                       |
| `CRON_EXPRESSION`   | Cron schedule expression for background jobs                 |
| `SMTP_HOST`         | SMTP server host (e.g., `localhost` for MailHog)             |
| `SMTP_PORT`         | SMTP server port (`1025` for MailHog)                        |
| `SMTP_FROM`         | Sender email address                                         |
| `SMTP_TO`           | Recipient email address for warning notifications            |


---
</details>

<details>
<summary><span style="font-size: 1.5em; font-weight: bold;">Test Coverage(Jest+supertest)</span></summary>

## Test Coverage(Jest+supertest)
```
--------------------------|---------|----------|---------|---------|----------------------------------------------
File                      | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                            
--------------------------|---------|----------|---------|---------|----------------------------------------------
All files                 |   62.07 |    34.16 |   63.71 |   61.82 |                                              
 src                      |   81.81 |     12.5 |   33.33 |   81.81 |                                              
  app.ts                  |   81.81 |     12.5 |   33.33 |   81.81 | 54-65,72                                     
 src/casbin               |      95 |        0 |     100 |   94.44 |                                              
  enforcer.ts             |      95 |        0 |     100 |   94.44 | 29                                           
 src/middleware           |   70.37 |       25 |      50 |   69.23 |                                              
  authMiddleware.ts       |   84.61 |      100 |     100 |   83.33 | 30-31                                        
  casbinMiddleware.ts     |   81.81 |       50 |     100 |   80.95 | 12-16,45-46                                  
  uploadMiddleware.ts     |   47.36 |        0 |       0 |   47.36 | 10,15-21,30-40                               
 src/modules/auth         |   94.11 |    66.66 |     100 |   94.11 |                                              
  auth.controller.ts      |      90 |      100 |     100 |      90 | 55,71                                        
  auth.repository.ts      |     100 |       75 |     100 |     100 | 34                                           
  auth.schema.ts          |     100 |      100 |     100 |     100 |                                              
  auth.service.ts         |      95 |       60 |     100 |      95 | 57                                           
 src/modules/equipment    |   52.25 |     41.5 |   72.72 |   52.25 |                                              
  equipment.controller.ts |   50.84 |    52.94 |   66.66 |   50.84 | 15-19,22-26,38-61,81-100,108-112,122,130-134 
  equipment.repository.ts |   53.06 |    42.85 |    87.5 |   53.06 | 141-177                                      
  equipment.schema.ts     |      75 |      100 |       0 |      75 | 62                                           
  equipment.service.ts    |   51.16 |    26.66 |   71.42 |   51.16 | 19-23,50-79,85,90                            
 src/modules/racks        |   51.92 |    31.25 |   61.11 |   52.21 |                                              
  rack.controller.ts      |   41.37 |        0 |   55.55 |   42.35 | 18-41,50-54,88-92,112-116,132-219            
  rack.repository.ts      |   64.28 |       50 |   61.53 |   65.45 | 91-92,99-100,103-104,129-172                 
  rack.schema.ts          |     100 |      100 |     100 |     100 |                                              
  rack.service.ts         |   52.45 |    27.77 |   61.53 |   50.84 | 18-22,73-75,83,96-153                        
 src/modules/warnings     |   64.58 |       25 |   63.63 |   64.58 |                                              
  warning.controller.ts   |   79.16 |       50 |     100 |   79.16 | 16,30,38-42,60                               
  warning.repository.ts   |      50 |    16.66 |      50 |      50 | 24-47,78-100                                 
 src/routes               |   88.88 |      100 |       0 |   88.88 |                                              
  admin.routes.ts         |      50 |      100 |       0 |      50 | 13-27,37-38                                  
  auth.routes.ts          |     100 |      100 |     100 |     100 |                                              
  equipment.routes.ts     |     100 |      100 |     100 |     100 |                                              
  index.ts                |     100 |      100 |     100 |     100 |                                              
  rack.routes.ts          |     100 |      100 |     100 |     100 |                                              
  warning.route.ts        |     100 |      100 |     100 |     100 |                                              
 src/scheduler            |   22.95 |        0 |      20 |   21.66 |                                              
  cronScheduler.ts        |   20.83 |        0 |   28.57 |   20.83 | 16-30,35-36,43-101                           
  mailer.ts               |   30.76 |        0 |       0 |      25 | 5,14-40                                      
 src/shared               |   70.58 |    58.33 |   83.33 |   69.23 |                                              
  db.ts                   |   58.82 |      100 |      60 |   58.82 | 19-20,36-41                                  
  errorHandler.ts         |   63.88 |    28.57 |     100 |   62.85 | 35-47,52-57,72-87                            
  logger.ts               |     100 |      100 |     100 |     100 |                                              
  sanitizer.ts            |     100 |      100 |     100 |     100 |                                              
--------------------------|---------|----------|---------|---------|----------------------------------------------

Test Suites: 1 failed, 3 passed, 4 total
Tests:       1 failed, 44 passed, 45 total
Snapshots:   0 total
Time:        12.968 s
Ran all test suites.
```
</details>


## Role Permissions

| Action | admin | operator | viewer |
|--------|-------|----------|--------|
| GET racks / equipment | ✓ | ✓ | ✓ |
| POST racks / equipment | ✓ | ✓ | ❌ |
| PUT racks / equipment | ✓ | ✓ | ❌ |
| DELETE racks / equipment | ✓ | ❌ | ❌ |
| Upload PDF | ✓ | ✓ | ❌ |
| Delete attachment | ✓ | ❌ | ❌ |
| View / resolve warnings | ✓ | ❌ | ❌ |
| Restart cron | ✓ | ❌ | ❌ |

---
## API Response Shape
All responses follow the same shape:
```
{ "success": true, "data": {} }
{ "success": false, "message": "...", "errors": [] }
```
## Test Scheduler

The cron job runs every 5 minutes and:
1. Queries all racks with zero equipment assigned
2. Skips racks that already have an unresolved warning in the last 10 minutes
3. Writes a `warnings` row for each newly empty rack
4. Sends an email via MailHog (if `SMTP_HOST` is configured)

**Hot-reload the schedule at runtime (Testing):**
```bash
# Open command prompt in windows and Login as admin
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"password123\"}"

# Restart with current expression
curl -b cookies.txt http://localhost:3000/admin/restart-cron

# Restart with new expression (every 10 minutes)
curl -b cookies.txt "http://localhost:3000/admin/restart-cron?expression=* * * * *"

# Check status
curl http://localhost:3000/api/admin/cron-status -b admin-cookies.txt

#after 1 minute,check http://localhost:8025 for the warning email.
```

## Output log in backend for scheduler(cron)
```
[Scheduler] Started with expression: "*/5 * * * *"

🚀 Server running on port 3000

📊 Environment: development

🔗 Health check: http://localhost:3000/healthz

[Scheduler] Running empty rack check at 2026-06-22T10:15:00.684Z

[Scheduler] Found 1 empty rack(s)

[Scheduler] Warning created for rack DEV-001 — ID: 45

[Mailer] Warning email sent for 1 empty rack(s)

[Scheduler] Running empty rack check at 2026-06-22T10:20:00.069Z

[Scheduler] Found 1 empty rack(s)

[Scheduler] Skipping DEV-001 — recent warning exists

[2026-06-22T10:22:17.077Z] GET /me 304 - 40ms

[2026-06-22T10:22:17.088Z] GET /me 304 - 5ms
```

---

## Manual Test Plan

### Auth
- [ ] `POST /api/auth/login` valid → 200 + cookie set
- [ ] `POST /api/auth/login` wrong password → 401
- [ ] `POST /api/auth/login` 11 attempts → 429 rate limited
- [ ] `GET /api/auth/me` with cookie → 200
- [ ] `GET /api/auth/me` no cookie → 401
- [ ] `POST /api/auth/logout` → 200 + cookie cleared

### Authorization
- [ ] viewer `DELETE /api/racks/1` → 403
- [ ] viewer `POST /api/racks` → 403
- [ ] operator `DELETE /api/racks/1` → 403
- [ ] operator `POST /api/racks` → 201
- [ ] admin `DELETE /api/racks/1` → 200
- [ ] no cookie any route → 401

### Uploads
- [ ] operator `POST /api/racks/1/upload` PDF ≤ 5MB → 201
- [ ] operator `POST /api/racks/1/upload` non-PDF → 400
- [ ] operator `POST /api/racks/1/upload` PDF > 5MB → 400
- [ ] `GET /api/racks/1/attachments` → 200 list
- [ ] admin `DELETE /api/racks/1/attachments/1` → 200

### Scheduler
- [ ] Cron fires every 5 min — visible in logs
- [ ] Empty rack → warning row written to DB
- [ ] `GET /admin/cron-status` → 200
- [ ] `GET /admin/restart-cron` → 200 restarted
- [ ] `GET /admin/restart-cron?expression=*/10 * * * *` → 200 new expression
- [ ] `GET /api/warnings` → 200 list
- [ ] `PATCH /api/warnings/1/resolve` → 200 resolved

---

## Security

| Layer | Protection |
|-------|-----------|
| Authentication | JWT verified on every protected route via `authMiddleware` |
| Authorization | Casbin denies by default — no matching policy = 403 |
| Credentials | Passwords never logged in plaintext anywhere |
| Session Cookie | `httpOnly` + `SameSite=Strict` |
| File Uploads | Multer uses UUID filenames — user-supplied names never used |
| Rate Limiting | 10 login attempts per 15 minutes |
| CORS | Restricted to `CORS_ORIGIN` only |
| SQL Injection | All SQL parameterized — no string interpolation |

---

## Self-Evaluation — Phase 3 Capstone

| Dimension | Score | Evidence |
|-----------|-------|----------|
| **D1 Functionality** | **4/4** | [Login/logout httpOnly cookie](./backend/src/modules/auth/auth.controller.ts) ✓ Casbin viewer can't delete ✓ [Multer PDF 5MB cap](./backend/src/middleware/uploadMiddleware.ts) ✓ node-cron writes warnings every 5min ✓ `GET /admin/restart-cron` hot-reloads ✓ [MailHog email on warnings](./images/mailhog.png) ✓ [Runtime expression change via query param](./images/cron%20expression.png) ✓ |
| **D2 Code Quality** | **3/4** | [`authMiddleware`](./backend/src/middleware/authMiddleware.ts), [`casbinMiddleware`](./backend/src/middleware/casbinMiddleware.ts), [`uploadMiddleware`](./backend/src/middleware/uploadMiddleware.ts) each isolated ✓ [Casbin model file committed](./backend/src/casbin/model.conf) [+ documented](./backend/src/casbin/policy.csv) ✓ [Scheduler class stoppable + restartable](./backend/src/scheduler/cronScheduler.ts) ✓ [Middleware composition as array in routes](./backend/src/routes/index.ts) ✓ |
| **D3 Validation/Security** | **4/4** | [JWT verified on every protected route](./backend/src/routes/index.ts) ✓ Casbin denies by default ✓ Multer restricts MIME + size ✓ Password never logged ✓ [`httpOnly` + `SameSite=Strict` cookie](./backend/src/modules/auth/auth.controller.ts) [✓ UUID filenames — never user-supplied](./backend//src/middleware/uploadMiddleware.ts) ✓ [Rate limit on login (10 req/15min) ✓](./backend/src/routes/auth.routes.ts) |
| **D4 Developer Experience** | **4/4** | [Seeded users for all 3 roles documented](#seeded-users) ✓ [One-command curl login in README](#one-command-login-check-curl) ✓ [`docker compose up`](docker-compose.yaml) works from fresh clone ✓ [`.env.example`](#environment-variables) covers all variables ✓ |
| **D5 Testing/Observability** | **3/4** | [Manual test plan 401 on unauthed ✓ 403 on forbidden ✓ 200 on allowed](#manual-test-plan) ✓ [Cron visible in logs ✓](#output-log-in-backend-for-schedulercron) [Coverage report committed ✓](#test-coveragejestsupertest)|

**Total: 18/20** — Ship bar met ✓ (all dimensions ≥ 3)

**Reviewed by:** Self
**Date:** 2026-06-07

---

## Author

Md. Rad Shahmat
