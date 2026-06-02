# Rack Tracker

> Full-stack inventory management system for tracking equipment placement in physical racks.
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

# 3. Fire it up
docker compose up
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000/api |
| Health Check | http://localhost:3000/healthz |

---

## 📁 Project Structure

```
rack-tracker/                         # Root
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── racks/                # controller, service, repository, schema, types
│   │   │   └── equipment/            # controller, service, repository, schema, types
│   │   ├── routes/
│   │   │   ├── index.ts              # Central router
│   │   │   ├── rack.routes.ts
│   │   │   └── equipment.routes.ts
│   │   ├── shared/
│   │   │   ├── db.ts                 # PG pool singleton
│   │   │   ├── errorHandler.ts
│   │   │   ├── logger.ts
│   │   │   └── sanitizer.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── Dockerfile
│   ├── nodemon.json
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── racks/
│   │   │   │   ├── api/              # rackApi.ts
│   │   │   │   ├── components/       # RackCard, RackForm, RackGrid
│   │   │   │   └── hooks/            # useRacks.ts
│   │   │   └── equipment/
│   │   │       ├── api/              # equipmentApi.ts
│   │   │       ├── components/       # EquipmentForm, EquipmentList, EquipmentTable
│   │   │       └── hooks/            # useEquipment.ts
│   │   ├── shared/
│   │   │   ├── api/                  # client.ts, queryKeys.ts
│   │   │   ├── components/           # Layout.tsx
│   │   │   └── types/                # api.types.ts
│   │   ├── components/ui/            # shadcn/ui components
│   │   ├── lib/                      # utils.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── db/
│   ├── 01-schema.sql                 # Tables, triggers, indexes
│   └── 02-seed.sql                   # Sample data (5 racks, 19 equipment)
├── docker-compose.yaml
└── README.md
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│  Frontend                               │
│  React 19 + Vite + TanStack Query v5    │
│  shadcn/ui + Tailwind CSS v4            │
└───────────────────┬─────────────────────┘
                    │ HTTP REST
┌───────────────────▼─────────────────────┐
│  Backend                                │
│  Express 5 + TypeScript                 │
│  Controller → Service → Repository      │
└───────────────────┬─────────────────────┘
                    │ Parameterized SQL
┌───────────────────▼─────────────────────┐
│  Database                               │
│  PostgreSQL 16                          │
│  Auto-seeded via docker-entrypoint      │
└─────────────────────────────────────────┘
```

**Hard rule:** SQL lives **only** in repositories. Zero SQL in controllers or services.

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
| **DB Driver** | node-postgres (pg) |
| **Containerization** | Docker + Docker Compose |

---

## 📚 API Reference

### Racks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/racks` | List all racks |
| GET | `/api/racks/:id` | Get single rack |
| POST | `/api/racks` | Create rack |
| PUT | `/api/racks/:id` | Update rack |
| DELETE | `/api/racks/:id` | Delete rack |

### Equipment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/equipment?page=1&limit=10` | List all equipment (paginated) |
| GET | `/api/equipment/:id` | Get single equipment |
| GET | `/api/equipment/rack/:rackId` | Get equipment by rack |
| POST | `/api/equipment` | Create equipment |
| PUT | `/api/equipment/:id` | Update equipment |
| DELETE | `/api/equipment/:id` | Delete equipment |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/healthz` | Service + DB health check |

---

## 🗃️ Database Schema

```sql
-- Racks
CREATE TABLE racks (
  id          SERIAL PRIMARY KEY,
  tag         VARCHAR(50)  UNIQUE NOT NULL,   -- e.g. RACK-A1
  name        VARCHAR(100) NOT NULL,
  location    VARCHAR(100),
  capacity    INT DEFAULT 42,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()       -- auto via trigger
);

-- Equipment
CREATE TABLE equipment (
  id             SERIAL PRIMARY KEY,
  tag            VARCHAR(50)  UNIQUE NOT NULL, -- e.g. SRV-001
  name           VARCHAR(100) NOT NULL,
  type           VARCHAR(50),
  rack_id        INT REFERENCES racks(id) ON DELETE SET NULL,
  slot_position  INT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()     -- auto via trigger
);
```

Seeded with **5 racks** and **19 equipment** items on first `docker compose up`.

---

## 🔒 Security

- ✅ Parameterized SQL everywhere (zero injection risk)
- ✅ Zod validation on all write endpoints (POST + PUT)
- ✅ CORS restricted to frontend origin via env var
- ✅ Input sanitization — auto-trim middleware on all requests
- ✅ No secrets in git — `.env.example` only
- ✅ Consistent error shape `{ success, message, errors[] }` across all endpoints
- ✅ Duplicate tag rejected with 400 before hitting the database

---

## 💻 Local Development (without Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env    # update DATABASE_URL to point to local postgres
npm run dev             # hot reload via nodemon
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env    # set VITE_API_URL=http://localhost:3000
npm run dev             # Vite dev server on :5173
```

### Environment Variables

**backend/.env.example**
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://rackuser:rackpass@localhost:5432/racktracker
CORS_ORIGIN=http://localhost:5173
```

**frontend/.env.example**
```env
VITE_API_URL=http://localhost:3000
```

---

## 🧪 Manual Test Plan

### Racks
- [ ] `POST /api/racks` valid body → 201
- [ ] `POST /api/racks` duplicate tag → 400
- [ ] `POST /api/racks` missing required field → 400
- [ ] `GET /api/racks` → 200 array
- [ ] `GET /api/racks/:id` valid → 200
- [ ] `GET /api/racks/:id` not found → 404
- [ ] `PUT /api/racks/:id` valid → 200 with updated_at changed
- [ ] `PUT /api/racks/:id` duplicate tag → 400
- [ ] `DELETE /api/racks/:id` valid → 200
- [ ] `DELETE /api/racks/:id` not found → 404
- [ ] `DELETE /api/racks/:id` → equipment rack_id set to NULL

### Equipment
- [ ] `POST /api/equipment` valid body → 201
- [ ] `POST /api/equipment` duplicate tag → 400
- [ ] `POST /api/equipment` invalid rack_id → 400
- [ ] `GET /api/equipment?page=1&limit=5` → 200 with pagination object
- [ ] `GET /api/equipment/:id` valid → 200
- [ ] `GET /api/equipment/:id` not found → 404
- [ ] `GET /api/equipment/rack/:rackId` valid → 200 array ordered by slot
- [ ] `GET /api/equipment/rack/999` → 404
- [ ] `PUT /api/equipment/:id` reassign rack → 200
- [ ] `PUT /api/equipment/:id` set rack_id null → 200
- [ ] `DELETE /api/equipment/:id` valid → 200

### System
- [ ] `GET /healthz` → 200 `{ status: "healthy" }`
- [ ] Frontend loads at http://localhost:5173
- [ ] Create rack via UI → appears in grid
- [ ] Create equipment via UI → appears in table
- [ ] Edit rack via UI → updates in place
- [ ] Delete equipment via UI → removed from table

---

## ✅ Self-Evaluation — Phase 2 Capstone

| Dimension | Score | Evidence |
|-----------|-------|----------|
| **D1 Functionality** | **4/4** | Full CRUD for racks + equipment via API and UI ✅ `docker compose up` brings up all 3 services with seeded DB ✅ Equipment placed in rack displayed in grid ✅ Pagination via `?page=&limit=` ✅ |
| **D2 Code Quality** | **4/4** | Controller → Service → Repository enforced ✅ Zero SQL outside repositories ✅ Modules co-located (`modules/racks/`, `modules/equipment/`) ✅ Singleton class exports ✅ Typed repository interfaces ✅ TanStack query key factory centralized ✅ |
| **D3 Validation/Security** | **4/4** | Zod on every write endpoint ✅ Structured errors `{ success, message, errors[] }` ✅ Parameterized SQL everywhere ✅ CORS restricted to frontend origin ✅ Duplicate tag → 400 via Zod refine ✅ Body sanitizer trim middleware ✅ |
| **D4 Developer Experience** | **4/4** | `docker compose up` works from fresh clone ✅ `.env.example` covers every variable ✅ Postgres seeds via `docker-entrypoint-initdb.d/` ✅ Healthcheck on Postgres + backend waits ✅ Hot reload on both frontend and backend ✅ |
| **D5 Testing/Observability** | **3/4** | Manual test plan covers create/list/update/delete for both resources ✅ Request logging middleware (method + path + status) ✅ `/healthz` endpoint with DB check ✅ |

**Total: 19/20** — Ship bar met ✅ (all dimensions ≥ 3, none below)

**Reviewed by:** Self
**Date:** 2025-05-24

---

## 📄 License

MIT