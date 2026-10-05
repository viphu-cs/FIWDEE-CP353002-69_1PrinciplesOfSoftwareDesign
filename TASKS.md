# TASKS.md — Backend + Frontend Integration Tracker

> Agent: open this file first, pick the next unfinished task in order, tick `[x]` with date/notes when done
> Rules + API contract live in `AGENTS.md`

## Legend
`[ ]` not started · `[~]` in progress/partial · `[x]` done · `[!]` blocked

---

## Phase 1 — Backend Foundation

- [x] 1.1 All 18 entities (`domain/entity/`) per the ER diagram
- [x] 1.2 All 9 enums (`domain/enums/`) — BookingStatus, PaymentMethod, PaymentStatus, QueueStatus, RefundStatus, RoomStatus, RoomType, UserRole, DayOfWeek
- [x] 1.3 All repository interfaces (`repository/`) — User, Customer, Therapist, Receptionist, Owner, Shop, BusinessHours, Service, ServiceDurationOption, Room, TherapistSchedule, TherapistSkill, WorkShift, Booking (query for free slots), QueueItem, Payment, Refund, Review (2026-10-04)
- [x] 1.4 Exception handling (`exception/`) — BusinessException, NotFoundException, ValidationException, ConflictException + GlobalExceptionHandler (@RestControllerAdvice) returning `{success, message, errors}` + ApiResponse (`common/`) (2026-10-04)
- [ ] 1.5 Request/response DTOs (`dto/`) + Mappers (`mapper/`) — start with Booking, Auth, Service, Therapist (fields must match the contract in AGENTS.md §5, e.g. `durationOptions`)
- [ ] 1.6 JWT Auth — `POST /api/auth/register`, `POST /api/auth/login`, replace permitAll in SecurityConfig with role-based rules (CUSTOMER/THERAPIST/RECEPTIONIST/OWNER), BCrypt passwords
- [x] 1.7 Seed data (CommandLineRunner or data.sql) — shop with 6 rooms, 6 therapists, 4 services with durationOptions, business hours, test owner/receptionist accounts

## Phase 2 — Core APIs

- [x] 2.1 `GET /api/services`, `GET /api/services/{id}` (public) with durationOptions
- [x] 2.2 `GET /api/therapists` (public) with active therapist profiles, skills, and average rating
- [ ] 2.3 Availability: `GET /api/bookings/availability?date=&serviceId=&durationMinutes=` — checks free rooms + matching therapist skills + 15-minute cleaning buffer (per sequence-diagram.md)
- [ ] 2.4 `POST /api/bookings` (CUSTOMER) + view own booking history
- [ ] 2.5 Booking State pattern (`pattern/state/`) — transitions: PENDING→CONFIRMED→CHECKED_IN→IN_SERVICE→COMPLETED→PAID / CANCELLED, invalid transition = error
- [ ] 2.6 Cancel: `PATCH /api/bookings/{id}/cancel`
- [ ] 2.7 Front-desk (RECEPTIONIST): check-in, `GET /api/admin/queue?date=`, change booking status, assign room/therapist
- [ ] 2.8 Therapist endpoints: own schedule, start/complete service (role THERAPIST)
- [ ] 2.9 Payment (Strategy pattern `pattern/strategy/`): `POST /api/bookings/{id}/payment` — PromptPay (mock QR) / cash, Payment = immutable, receipt
- [ ] 2.10 Observer pattern (`pattern/observer/`) — booking created/cancelled/queue-called events → notifications
- [ ] 2.11 Review: `POST /api/bookings/{id}/review` (only for COMPLETED bookings)
- [x] 2.12 Admin CRUD (OWNER/RECEPTIONIST): rooms, services (+durations), therapists (+skills, schedules)
- [ ] 2.13 Refund (if specified in use-case) — immutable like Payment
- [ ] 2.14 Users summary endpoints: `GET /api/admin/users` (all registered users, counts by role), `GET /api/admin/users/online` (currently logged-in sessions) — mock page already exists (see 4.8); backend response must include: total count, online count, active-today count, new-this-month count, per-user fields (name, email, phone, role, session status, registeredAt, lastLoginAt, totalBookings)

## Phase 3 — Reports + Wrap-up

- [ ] 3.1 Dashboard/Reports (UC-22): daily/monthly revenue, therapist commission (aggregation queries, no extra tables), booking counts
- [ ] 3.2 Tests: unit tests for Services (Mockito) + integration tests for key controllers (booking flow, payment)
- [ ] 3.3 Full DTO validation coverage, CORS config for the frontend origin

## Phase 4 — Frontend Integration

- [ ] 4.1 Create `src/lib/api.js` — axios/fetch wrapper, baseURL from `import.meta.env.VITE_API_URL`, attach JWT, interceptor for 401/error format
- [ ] 4.2 Real auth context — Login/Register call `/api/auth/*`, store token + role, replace localStorage `fiwdee_admin_auth`
- [ ] 4.3 Replace mocks on Services + Therapists pages with `GET /api/services`, `GET /api/therapists`
- [ ] 4.4 Replace Booking wizard mocks — call availability + create booking + real payment
- [ ] 4.5 Admin pages (Dashboard, Bookings, Queue, Therapists, Rooms, Services) call admin endpoints
- [ ] 4.6 Therapist view — schedule + start/complete service
- [ ] 4.7 i18n — verify backend error messages display in TH/EN (backend sends message keys or frontend maps them)
- [x] 4.8 Admin Users summary page (`src/admin/pages/AdminUsers.jsx`, mock data in `AdminAuthContext.jsx`) — separate "currently logged-in" panel (online sessions + force logout) from "all registered users" table, with summary cards (total / online / active today / new this month), role + session filters, search — **no DB yet**; wire it to `GET /api/admin/users` when 2.14 is done (2026-10-03)

---

## Notes / Blockers

| Date | Note |
|---|---|
| 2026-10-03 | File created — entities/enums done, everything else not started |
| 2026-10-03 | Added Admin Users summary page (frontend mock, no DB) — `#admin/users` route; backend counterpart tracked in 2.14, API wiring in 4.8 |
| 2026-10-03 | Created treatment images (service-thai, service-aroma, service-warm-oil, service-foot), added image fields in mock.js and BookingPage, updated ServicesPage and BookingPage UI with fallback |
| 2026-10-04 | Phase 0 Foundation completed: JJWT dependencies, ApiResponse wrapper, Exception handling (BusinessException, NotFoundException, ValidationException, ConflictException, GlobalExceptionHandler), and all 18 repository interfaces with core queries |
| 2026-10-05 | Dev 2 step 1 completed: public service catalog endpoints return active services and active duration options through DTO/Mapper; `mvnw.cmd compile` BUILD SUCCESS |
| 2026-10-05 | Dev 2 steps 2–3 completed: therapist catalog, admin resource CRUD, shop/business hours, and therapist schedules with shift overlap validation; `mvnw.cmd compile` BUILD SUCCESS. Admin role enforcement remains TODO pending shared method security; therapist password encoding remains TODO pending the shared PasswordEncoder bean. |
| 2026-10-05 | Dev 2 step 4 completed: idempotent non-prod DataSeeder adds shop/hours, rooms, services/durations, therapists/skills, sample shifts, and encoded test accounts; `mvnw.cmd compile` BUILD SUCCESS |
