# AGENTS.md — Guide for AI Agents working on the FIWDEE project

> Read this file before touching any code. Check current progress in `TASKS.md`.

## 1. What the project is

**FIWDEE — Massage Management & Booking System** (course project CP353002-69 Principles of Software Design)
- Online booking website + front-desk queue management for a Thai massage shop
- The shop has **6 massage rooms and up to 6 therapists per day** — all of these values are dynamic data from the DB, **never hard-code** them anywhere
- 4 user roles: **Owner** (full admin + reports), **Receptionist** (check-in, queue, payment), **Therapist** (own schedule, start/complete service), **Customer** (booking, reviews)

## 2. Repo layout

```
doc/                  # full spec — source of truth for design
  use-case.md         #   UC-01..27, every feature
  domain-model.md     #   entities + business rules
  er-diagram.md       #   DB tables
  class-diagram.md    #   package structure (src/main/java/com/fiwdee/...)
  design-patterns.md  #   Layered Arch, State, Strategy, Observer
  sequence-diagram.md #   flows for key use cases
code/
  backend/            # Spring Boot 4.1.1 (Java 17) + PostgreSQL, Maven
  frontend/           # React 19 + Vite 8 + Tailwind 4, hash-router, i18n TH/EN
docker-compose.yml    # postgres + backend(:8080) + frontend(:3000)
TASKS.md              # task checklist + progress — update it every time work is done
```

## 3. Hard rules (do not violate)

1. **Backend must follow the layered architecture in `doc/design-patterns.md`**: `controller/api` → `service` (+`service/impl`) → `repository` → `domain/entity` — Controllers never touch the DB directly, Services never know about DTOs
2. **Use the package structure already scaffolded**: `com.fiwdee.{controller.api, service, service.impl, repository, domain.entity, domain.enums, dto.request, dto.response, mapper, exception, pattern.state, pattern.strategy, pattern.observer, config, common}`
3. **Three mandatory design patterns**: State (booking lifecycle), Strategy (payment: PromptPay/cash), Observer (notifications/queue events) — details in `doc/design-patterns.md`
4. **Never hard-code** room counts, therapist counts, prices, or opening hours — in backend or frontend
5. **Frontend**: all UI text lives in `src/i18n/locales/{th,en}.js` — no hard-coded strings in pages
6. **Booking has `@Version` (optimistic locking)** — do not remove it; **`Payment` is an immutable audit record** — never UPDATE it
7. If you change design/contract → update `doc/` so it stays consistent

## 4. Current state (short summary)

- **Entities + enums are DONE** — 18 entities in `domain/entity` + 9 enums in `domain/enums` (good quality, don't recreate them)
- **Still missing**: repositories, services, controllers, DTOs, mappers, exception handler, JWT auth, seed data
- **SecurityConfig** is still permitAll (dev mode) — must become JWT + role-based
- **Frontend is complete for every page but 100% mock data** from `src/data/mock.js` — no fetch/axios calls yet

## 5. Backend ↔ Frontend contract (API Contract)

**Base URL**: `/api` on the backend (http://localhost:8080) — frontend reads env `VITE_API_URL`
**Auth**: JWT Bearer token (header `Authorization: Bearer <token>`)
**Unified response format**: `{ success: boolean, message: string, data: ... }`, error → `{ success: false, message, errors? }`

### Endpoints the frontend expects (mapped to existing pages)

| Frontend page | Endpoint | Notes |
|---|---|---|
| Landing/Services | `GET /api/services` (with `durationOptions`) | mock.js uses `durationOptions: [{durationMinutes, price}]` — DTO fields must use the same names |
| Therapists | `GET /api/therapists` | with skills and photo |
| Booking wizard | `POST /api/bookings`, `GET /api/bookings/availability?date=&serviceId=&durationMinutes=` | returns available room + therapist slots |
| Booking payment | `POST /api/bookings/{id}/payment` | PromptPay (mock) via Strategy pattern |
| Login/Register | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` | login รับ `{identifier, password}` — identifier เป็น email/username/phone ก็ได้ → คืน `{token, tokenType, userId, username, fullName, email, phoneNumber, role}`; register (Public) สร้าง CUSTOMER + BCrypt + auto-login คืน token ทันที |
| Admin Dashboard/Bookings/Queue | `GET /api/admin/bookings?date=`, `GET /api/admin/queue?date=`, `PATCH /api/bookings/{id}/status` | status follows the State pattern |
| Admin Therapists/Rooms/Services | CRUD `/api/admin/therapists`, `/rooms`, `/services` | role Owner/Receptionist |
| Admin Users summary | `GET /api/admin/users`, `GET /api/admin/users/online`, `POST /api/admin/users/{id}/force-logout` | Role OWNER; `/users` คืน `{totalUsers, onlineUsers, activeToday, newThisMonth, users:[{id, name, email, phone, role, status(ONLINE/OFFLINE/SUSPENDED), registeredAt, lastLoginAt, onlineSince, totalBookings}]}`; online = มี valid token ภายใน 15 นาทีล่าสุด (`fiwdee.security.online-window-minutes`) — หน้า `#admin/users` เชื่อม API จริงแล้ว |
| Therapist (self-service) | `GET /api/therapist/me/schedule`, `POST /api/therapist/queue/{id}/start`, `/complete` | role Therapist |
| Review | `POST /api/bookings/{id}/review` | |

**Frontend integration**: `src/lib/api.js` พร้อมใช้แล้ว (fetch wrapper + Bearer token จาก localStorage `fiwdee_token`, dev ใช้ `.env.development` ชี้ `VITE_API_URL=http://localhost:8080/api`) — Auth (customer + admin) และหน้า `#admin/users` เชื่อม API จริงแล้ว; หน้าที่เหลือยังใช้ mock รอตามแผน Dev 2–5

## 6. How to run / test

```bash
docker compose up -d postgres          # DB
cd code/backend && ./mvnw spring-boot:run   # backend :8080
cd code/frontend && npm run dev             # frontend :5173 (dev)
```
- DB: `fiwdee_db` (postgres), `ddl-auto=update`
- After backend changes: `./mvnw compile` must pass before submitting work

## 7. Before finishing any task

1. ✅ Code follows the layered architecture + package layout
2. ✅ `./mvnw compile` (backend) or `npm run build` (frontend) passes
3. ✅ Update the checkbox + notes in `TASKS.md`
4. ✅ If design/contract changed → update `doc/` and section 5 of this file
