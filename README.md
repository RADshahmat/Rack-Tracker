# Rack Tracker v2

> Extends v1 with JWT auth, Casbin RBAC, PDF uploads, and a cron scheduler with warnings.
> Express 5 + TypeScript + PostgreSQL + React 19 + Docker

---

## 🚀 Quick Start

### Prerequisites
- Docker >= 24.0
- Docker Compose >= 2.20

```bash
# 1. Clone
git clone <repository-url>
cd rack-tracker

# 2. Environment setup
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Start everything
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health Check | http://localhost:3000/healthz |
| MailHog UI | http://localhost:8025 |

---

## 🔐 Default Users

| Username | Password | Role |
|----------|----------|------|
| `admin` | `password123` | Full access |
| `operator` | `password123` | No delete |
| `viewer` | `password123` | Read only |

### One-command login (curl)

```bash
# Login as admin
curl -c cookies.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Access protected route
curl -b cookies.txt http://localhost:3000/api/racks

# Logout
curl -b cookies.txt -X POST http://localhost:3000/api/auth/logout
```

---

## 📁 Project Structure

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

## 🏗️ Architecture

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

## 📚 API Reference

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

## 🔒 Role Permissions

| Action | admin | operator | viewer |
|--------|-------|----------|--------|
| GET racks / equipment | ✅ | ✅ | ✅ |
| POST racks / equipment | ✅ | ✅ | ❌ |
| PUT racks / equipment | ✅ | ✅ | ❌ |
| DELETE racks / equipment | ✅ | ❌ | ❌ |
| Upload PDF | ✅ | ✅ | ❌ |
| Delete attachment | ✅ | ❌ | ❌ |
| View / resolve warnings | ✅ | ❌ | ❌ |
| Restart cron | ✅ | ❌ | ❌ |

---

## 🗃️ Database Schema

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

## ⏰ Scheduler

The cron job runs every 5 minutes and:
1. Queries all racks with zero equipment assigned
2. Skips racks that already have an unresolved warning in the last 10 minutes
3. Writes a `warnings` row for each newly empty rack
4. Sends an email via MailHog (if `SMTP_HOST` is configured)

**Hot-reload the schedule at runtime:**
```bash
# Restart with current expression
curl -b cookies.txt http://localhost:3000/admin/restart-cron

# Restart with new expression (every 10 minutes)
curl -b cookies.txt "http://localhost:3000/admin/restart-cron?expression=*/10 * * * *"
```

---

## 💻 Environment Variables

**`backend/.env.example`**
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://rackuser:rackpass@localhost:5432/racktracker
CORS_ORIGIN=http://localhost:5173

# Auth
JWT_SECRET=supersecretjwtsecretchangethisinproduction
JWT_EXPIRES_IN=7d

# Scheduler
CRON_EXPRESSION=*/5 * * * *

# SMTP (stretch — MailHog)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=rack-tracker@rack.local
SMTP_TO=admin@rack.local
```

**`frontend/.env.example`**
```env
VITE_API_URL=http://localhost:3000
```

---

## 🧪 Manual Test Plan

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

## ✅ Self-Evaluation — Phase 3 Capstone

| Dimension | Score | Evidence |
|-----------|-------|----------|
| **D1 Functionality** | **4/4** | Login/logout httpOnly cookie ✅ Casbin viewer can't delete ✅ Multer PDF 5MB cap ✅ node-cron writes warnings every 5min ✅ `GET /admin/restart-cron` hot-reloads ✅ MailHog email on warnings ✅ Runtime expression change via query param ✅ |
| **D2 Code Quality** | **4/4** | `authMiddleware`, `casbinMiddleware`, `uploadMiddleware` each isolated ✅ Casbin model file committed + documented ✅ Scheduler class stoppable + restartable ✅ Middleware composition as array in routes ✅ |
| **D3 Validation/Security** | **4/4** | JWT verified on every protected route ✅ Casbin denies by default ✅ Multer restricts MIME + size ✅ Password never logged ✅ `httpOnly` + `SameSite=Strict` cookie ✅ UUID filenames — never user-supplied ✅ Rate limit on login (10 req/15min) ✅ |
| **D4 Developer Experience** | **4/4** | Seeded users for all 3 roles documented ✅ One-command curl login in README ✅ `docker compose up` works from fresh clone ✅ `.env.example` covers all variables ✅ |
| **D5 Testing/Observability** | **3/4** | 401 on unauthed ✅ 403 on forbidden ✅ 200 on allowed ✅ Cron visible in logs ✅ |

**Total: 19/20** — Ship bar met ✅ (all dimensions ≥ 3)

**Reviewed by:** Self
**Date:** 2026-06-07

---

## 📄 License

MIT
