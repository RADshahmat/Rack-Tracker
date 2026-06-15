# Changelog

All notable changes to Rack Tracker are documented here.

---

## [v2.0.0] — 2026-06-07

### Added

#### Auth
- Cookie-based JWT authentication (`httpOnly`, `SameSite=Strict`)
- `POST /api/auth/login` — issues JWT cookie on valid credentials
- `POST /api/auth/logout` — clears session cookie
- `GET /api/auth/me` — returns current user from cookie
- `authMiddleware` — verifies JWT on every protected route, returns 401 on missing/invalid cookie
- Rate limiter on login endpoint (10 requests per 15 minutes per IP)
- bcrypt password hashing — passwords never stored or logged in plaintext
- Seeded users for all three roles (`admin`, `operator`, `viewer`) with documented credentials

#### Authorization
- Casbin RBAC with `model.conf` and `policy.csv` committed to repo
- `casbinMiddleware` — checks role permission on every request, returns 403 on denial
- Deny-by-default policy — all access must be explicitly granted
- Path normalization to match Casbin wildcard patterns (`/api/racks/1` → `/api/racks/:id`)
- Three roles: `admin` (full access), `operator` (no delete), `viewer` (read only)

#### File Uploads
- `POST /api/racks/:id/upload` — attach a PDF spec sheet to a rack
- `GET /api/racks/:id/attachments` — list attachments for a rack
- `DELETE /api/racks/:id/attachments/:attachmentId` — delete attachment (admin only)
- Multer disk storage with UUID filenames — user-supplied filename never used
- 5MB file size cap enforced at middleware level
- PDF-only MIME type + extension validation
- File cleanup on upload error or rack-not-found
- `rack_attachments` table with uploader reference
- Docker volume for persistent PDF storage

#### Scheduler
- `node-cron` job running every 5 minutes
- Detects racks with zero equipment assigned via LEFT JOIN aggregation
- Writes a `warnings` row per empty rack (deduplication — skips if recent warning exists within 10 minutes)
- `CronScheduler` class with `start()`, `stop()`, `restart()`, `getStatus()` methods
- `GET /admin/restart-cron` — hot-reloads the scheduler at runtime
- `GET /admin/restart-cron?expression=` — changes cron expression at runtime
- `GET /admin/cron-status` — returns running status and current expression
- Cron job visible in server logs on every run

#### Warnings
- `warnings` table with `rack_id`, `rack_tag`, `message`, `resolved`, `emailed` fields
- `GET /api/warnings` — list all warnings (admin only)
- `GET /api/warnings/unresolved` — list unresolved warnings (admin only)
- `PATCH /api/warnings/:id/resolve` — mark a warning as resolved (admin only)

#### Email (Stretch)
- Nodemailer transport pointing to MailHog mock SMTP
- Warning email sent on each cron run when new empty racks are found
- `emailed` flag updated in DB after successful send
- MailHog web UI available at `http://localhost:8025`
- Graceful skip if `SMTP_HOST` not configured

#### Database
- `users` table with role constraint (`admin` | `operator` | `viewer`)
- `rack_attachments` table
- `warnings` table
- `03-users.sql` seed file with bcrypt-hashed passwords for all three roles
- Indexes on `users.username`, `users.email`, `rack_attachments.rack_id`, `warnings.rack_id`, `warnings.resolved`

#### Frontend
- Login page with username + password form
- Auth context — loads current user from `GET /api/auth/me` on app start
- Redirect to `/login` on 401
- Role-based UI — delete buttons hidden for operator/viewer
- Upload PDF button shown for operator and admin on rack detail
- Scheduler page (admin only) — cron status card + warnings table
- Sidebar Scheduler item visible to admin only
- Warnings table with All / Unresolved filter tabs and Resolve button
- Auto-refresh warnings every 30 seconds
- Auto-refresh cron status every 10 seconds

---

## [v1.0.0] — 2026-05-24

### Added

#### Backend
- Express 5 + TypeScript project setup
- Controller → Service → Repository architecture
- `GET/POST/PUT/DELETE /api/racks` — full CRUD for racks
- `GET/POST/PUT/DELETE /api/equipment` — full CRUD for equipment
- `GET /api/equipment?page=&limit=` — paginated equipment list
- `GET /api/equipment/rack/:rackId` — equipment filtered by rack
- `GET /api/racks/:id/slots` — available vs occupied slot computation
- Zod validation on all write endpoints
- Structured error responses `{ success, message, errors[] }` across all endpoints
- Duplicate tag detection with 400 response
- Parameterized SQL throughout — zero interpolation
- CORS restricted to frontend origin via env var
- Body sanitizer middleware — auto-trims all string fields
- Request logging middleware — method + path + status + duration
- `GET /healthz` — service and DB health check
- PostgreSQL pool singleton
- `docker-entrypoint-initdb.d` schema + seed setup
- Postgres healthcheck with backend service dependency
- Hot reload via nodemon in development

#### Frontend
- Vite + React 19 + TypeScript setup
- TanStack Query v5 with centralized query key factory
- shadcn/ui + Radix UI component library
- Tailwind CSS v4
- React Router v6
- Racks page — grid of rack cards with CRUD
- Equipment page — paginated table with CRUD
- Rack detail — slot grid + equipment list
- Create/Edit forms with client-side validation
- Toast notifications for all actions
- Responsive layout with sidebar navigation
- Axios client with `withCredentials: true`

#### Database
- `racks` table with `updated_at` trigger
- `equipment` table with FK to racks (`ON DELETE SET NULL`)
- `01-schema.sql` — tables + triggers + indexes
- `02-seed.sql` — 5 racks, 19 equipment items

#### Infrastructure
- Docker Compose with Postgres, backend, frontend on shared bridge network
- Separate Dockerfiles for backend and frontend
- `.env.example` for both services
- `uploads/` Docker volume for file persistence
