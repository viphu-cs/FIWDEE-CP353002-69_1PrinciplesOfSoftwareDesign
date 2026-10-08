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
- [x] 1.6 JWT Auth — `POST /api/auth/register`, `POST /api/auth/login`, replace permitAll in SecurityConfig with role-based rules (CUSTOMER/THERAPIST/RECEPTIONIST/OWNER), BCrypt passwords (2026-10-06 — Dev 1: JwtTokenProvider + JwtAuthenticationFilter + SecurityConfig RBAC; `GET /api/auth/me` ด้วย; login รับ identifier ได้ทั้ง email/username/phone; register = BCrypt + auto-login)
- [ ] 1.7 Seed data (CommandLineRunner or data.sql) — shop with 6 rooms, 6 therapists, 4 services with durationOptions, business hours, test owner/receptionist accounts (**หมายเหตุ:** บัญชี owner/receptionist ทดสอบถูก seed แล้วโดย `config/AdminAccountInitializer.java` ของ Dev 1 — idempotent เช็ค existsByEmail ก่อนสร้าง; Dev 2 ทำ DataSeeder 1.7 ให้เช็คแบบเดียวกันเพื่อเลี่ยง unique constraint)

## Phase 2 — Core APIs

- [ ] 2.1 `GET /api/services`, `GET /api/services/{id}` (public) with durationOptions
- [ ] 2.2 `GET /api/therapists` (public) with skills + schedule summary
- [ ] 2.3 Availability: `GET /api/bookings/availability?date=&serviceId=&durationMinutes=` — checks free rooms + matching therapist skills + 15-minute cleaning buffer (per sequence-diagram.md)
- [~] 2.4 `POST /api/bookings` (CUSTOMER) + view own booking history (**view own history เสร็จแล้ว** 2026-10-07: `GET /api/bookings/my` — BookingController/BookingService/BookingMapper + `MyBookingResponseDTO` + query fetch-join `findDetailedByCustomerIdOrderByStartDateTimeDesc`; หน้า `#my-bookings` เชื่อมแล้ว — **คงเหลือ POST /api/bookings ให้ Dev 2 ทำต่อ**)
- [ ] 2.5 Booking State pattern (`pattern/state/`) — transitions: PENDING→CONFIRMED→CHECKED_IN→IN_SERVICE→COMPLETED→PAID / CANCELLED, invalid transition = error
- [ ] 2.6 Cancel: `PATCH /api/bookings/{id}/cancel`
- [ ] 2.7 Front-desk (RECEPTIONIST): check-in, `GET /api/admin/queue?date=`, change booking status, assign room/therapist
- [ ] 2.8 Therapist endpoints: own schedule, start/complete service (role THERAPIST)
- [ ] 2.9 Payment (Strategy pattern `pattern/strategy/`): `POST /api/bookings/{id}/payment` — PromptPay (mock QR) / cash, Payment = immutable, receipt
- [ ] 2.10 Observer pattern (`pattern/observer/`) — booking created/cancelled/queue-called events → notifications
- [ ] 2.11 Review: `POST /api/bookings/{id}/review` (only for COMPLETED bookings)
- [ ] 2.12 Admin CRUD (OWNER/RECEPTIONIST): rooms, services (+durations), therapists (+skills, schedules)
- [ ] 2.13 Refund (if specified in use-case) — immutable like Payment
- [x] 2.14 Users summary endpoints: `GET /api/admin/users` (all registered users, counts by role), `GET /api/admin/users/online` (currently logged-in sessions) — mock page already exists (see 4.8); backend response must include: total count, online count, active-today count, new-this-month count, per-user fields (name, email, phone, role, session status, registeredAt, lastLoginAt, totalBookings) (2026-10-06 — Dev 1: UserService + UserSessionService (in-memory online window 15 นาที) + AdminUserController (OWNER only) + เพิ่ม POST /api/admin/users/{id}/force-logout; User entity เพิ่มคอลัมน์ `last_login_at`)

## Phase 3 — Reports + Wrap-up

- [ ] 3.1 Dashboard/Reports (UC-22): daily/monthly revenue, therapist commission (aggregation queries, no extra tables), booking counts
- [ ] 3.2 Tests: unit tests for Services (Mockito) + integration tests for key controllers (booking flow, payment)
- [ ] 3.3 Full DTO validation coverage, CORS config for the frontend origin

## Phase 4 — Frontend Integration

- [x] 4.1 Create `src/lib/api.js` — axios/fetch wrapper, baseURL from `import.meta.env.VITE_API_URL`, attach JWT, interceptor for 401/error format (2026-10-06 — ไฟล์มีอยู่แล้วใช้ fetch + Bearer token จาก localStorage `fiwdee_token`; เพิ่ม `.env.development` ชี้ VITE_API_URL=http://localhost:8080/api เพราะ Vite dev server ไม่มี proxy)
- [x] 4.2 Real auth context — Login/Register call `/api/auth/*`, store token + role, replace localStorage `fiwdee_admin_auth` (2026-10-06 — Dev 1: AdminAuthContext login ผ่าน POST /api/auth/login + เก็บ `fiwdee_token`, ลบ `fiwdee_admin_auth`, บังคับ role OWNER/RECEPTIONIST; หน้า Login/Register ลูกค้าเรียก API จริง; AdminUsers ดึง GET /api/admin/users + force-logout)
- [ ] 4.3 Replace mocks on Services + Therapists pages with `GET /api/services`, `GET /api/therapists`
- [ ] 4.4 Replace Booking wizard mocks — call availability + create booking + real payment
- [ ] 4.5 Admin pages (Dashboard, Bookings, Queue, Therapists, Rooms, Services) call admin endpoints
- [ ] 4.6 Therapist view — schedule + start/complete service
- [ ] 4.7 i18n — verify backend error messages display in TH/EN (backend sends message keys or frontend maps them)
- [x] 4.8 Admin Users summary page (`src/admin/pages/AdminUsers.jsx`, mock data in `AdminAuthContext.jsx`) — separate "currently logged-in" panel (online sessions + force logout) from "all registered users" table, with summary cards (total / online / active today / new this month), role + session filters, search — **no DB yet**; wire it to `GET /api/admin/users` when 2.14 is done (2026-10-03) → **wired to real API 2026-10-06:** ลบ mock `initialUsers`/`forceLogoutUser` ออกจาก AdminAuthContext แล้ว, หน้าเด้งข้อมูลจาก `GET /api/admin/users` (การ์ดสรุปใช้ตัวเลขจาก backend), Force Logout เรียก `POST /api/admin/users/{id}/force-logout`

---

## Notes / Blockers

| Date | Note |
|---|---|
| 2026-10-03 | File created — entities/enums done, everything else not started |
| 2026-10-03 | Added Admin Users summary page (frontend mock, no DB) — `#admin/users` route; backend counterpart tracked in 2.14, API wiring in 4.8 |
| 2026-10-03 | Created treatment images (service-thai, service-aroma, service-warm-oil, service-foot), added image fields in mock.js and BookingPage, updated ServicesPage and BookingPage UI with fallback |
| 2026-10-04 | Phase 0 Foundation completed: JJWT dependencies, ApiResponse wrapper, Exception handling (BusinessException, NotFoundException, ValidationException, ConflictException, GlobalExceptionHandler), and all 18 repository interfaces with core queries |
| 2026-10-06 | **Dev 1 (Auth/Security/Users) เสร็จ:** backend — JwtTokenProvider/JwtAuthenticationFilter/SecurityConfig (RBAC, permitAll → JWT), AuthController (register/login/me), AdminUserController (users, users/online, force-logout), AuthService/UserService + impl, UserSessionService (online window), DTOs Auth*/User*/AdminUserSummary + UserMapper, UserRepository +findByPhoneNumber/+existsByPhoneNumber, User +last_login_at, AdminAccountInitializer (บัญชีทดสอบ owner/receptionist idempotent); frontend — admin login ใช้ JWT จริง (ลบ fiwdee_admin_auth, role จาก backend), AdminUsers เรียก API จริง (ลบ mock users), หน้า Login/Register ลูกค้าเรียก /api/auth/* (Google Sign-In ยังไม่รองรับ แสดงข้อความแจ้ง), เพิ่ม i18n keys `admin.err*`/`admin.users*`/`auth.*` (th/en), `.env.development`; `./mvnw compile` + `npm run build` ผ่าน |
| 2026-10-07 | จัดทำเอกสาร **System Requirements Specification (SRS)** ฉบับสมบูรณ์ที่ `doc/system-requirements.md` ครอบคลุม Customer/Receptionist/Therapist/Owner Journey, Layout Blueprints, UI/UX Design System, และ Backend Architecture แบบอ่านเข้าใจง่ายและละเอียดรอบด้าน |
| 2026-10-06 | **ทดสอบ end-to-end ใน docker compose ผ่าน:** postgres+backend+frontend รันครบ; auth suite 11/11 (register 201, duplicate 409, validation 400, login owner/phone, wrong password 401, me, no-token 401, customer→admin 403), admin suite 12/12 (users summary, online, force-logout, 404, receptionist 403); ทดสอบ UI จริง — admin login → หน้า #admin/users แสดงข้อมูลจาก DB, ลูกค้า login ผิดแสดง error / ถูกเด้งไป #booking พร้อม JWT. **แก้เพิ่ม 2 จุด:** (1) `ReviewRepository` Phase 0 มี derived query อ้าง property ที่ไม่มี (`findByTherapistId`/`findByCustomerId`) ทำ backend boot ไม่ขึ้น → เปลี่ยนเป็น `findByBookingTherapistId`/`findByBookingCustomerId` (ไฟล์ของ Dev 4 — ใช้ชื่อ method ใหม่เมื่อทำ module Review), (2) `GET /api/auth/me` ไม่ส่ง token ได้ 500 → บังคับ authenticated + null guard แล้วได้ 401 |
| 2026-10-07 | **Navbar Login↔โปรไฟล์ + หน้าโปรไฟล์/ประวัติการจอง (เชื่อม DB จริง) เสร็จ:** backend — แก้ build ที่พังจาก merge Dev 4 (`BookingRepository.findDetailedById` หาย), เพิ่ม `PUT /api/auth/me` (UpdateProfileRequestDTO + UserService.updateProfile + UserResponseDTO เพิ่ม username/healthNotes/preferredPressure + SecurityConfig PUT rule), `GET /api/bookings/my` (BookingController/Service/Mapper), `DemoDataSeeder` (customer@test.com/customer1234 + shop/room/service/therapist ขั้นต่ำ + booking 4 สถานะ, idempotent เช็ค exists ก่อนเสมอ — ทับซ้อนบางส่วนกับ 1.7 ของ Dev 2 แต่เดินร่วมกันได้); frontend — `CustomerAuthContext` (useCustomerAuth), navbar สลับปุ่มจองคิว→ปุ่มเข้าสู่ระบบ (ไม่ล็อกอิน) / avatar+dropdown (ล็อกอิน: ข้อมูลผู้ใช้/ประวัติการจอง/logout), routes ใหม่ `#profile`+`#my-bookings` พร้อม login guard, login เสร็จไปหน้าแรก (มี `fiwdee_pending_redirect` ค่อยพากลับ), ลบทางลัดข้ามล็อกอินในหน้า login, หน้า `CustomerProfilePage` (แก้ชื่อ/อีเมล/เบอร์/แรงนวด/บันทึกสุขภาพ/เปลี่ยนรหัสผ่าน) + `BookingHistoryPage`, i18n `nav.*`/`profile.*`/`history.*` (th/en), เพิ่ม `TEST_ACCOUNTS.md`; **bug ที่เจอและแก้ระหว่างทดสอบ UI:** (1) `isCustomerLoggedIn()` เช็คแค่ `fiwdee_customer_auth` ไม่เช็ค token → localStorage เก่ายุค mock ทำให้ guard จองคิวหลุด → บังคับเช็คทั้ง token+profile, (2) promo pill ย่อ `z-[80]` บัง dropdown โปรไฟล์ → ลดเป็น `z-40`; ทดสอบ API ผ่าน 10 กรณี (PUT profile, 401, my-bookings 4 รายการ, รหัสผ่านผิด 400, email ซ้ำ 409, เปลี่ยนรหัสผ่านครบวงจร) + UI ผ่าน 9 test points (navbar สลับ, pending redirect, dropdown, แก้โปรไฟล์ sync navbar, ประวัติ+badge, logout, login→home); `./mvnw compile` + `npm run build` ผ่าน |
| 2026-10-07 | **ปรับ UI หน้าโปรไฟล์ + ประวัติการจองเป็นแบบตาราง (ผู้ใช้ขอ):** หน้า `#profile` เรียงเป็นตาราง 3 การ์ด — ข้อมูลบัญชี (อ่านอย่างเดียว, header avatar+ชื่อ), ข้อมูลส่วนตัว (ฟอร์ม label→input เป็นแถวตาราง), เปลี่ยนรหัสผ่าน; หน้า `#my-bookings` เปลี่ยนจากการ์ดเป็น `<table>` 7 คอลัมน์ (รหัส/บริการ/วัน-เวลา/หมอนวด/ห้อง·ระยะเวลา/ราคา/สถานะ) พร้อม hover, overflow-x-auto บนจอเล็ก (min-w 880px); เพิ่ม i18n keys `history.service`/`history.statusHeader` (th/en); logic/endpoint เดิมทุกอย่าง ไม่มีการแก้ backend; ตรวจ UI จริงบนเบราว์เซอร์ + `npm run build` ผ่าน |
