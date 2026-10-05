# 📋 แผนการแบ่งงาน Backend ทีม 5 คน (Zero-Conflict Work Breakdown)

> **FIWDEE — Massage Management & Booking System**  
> รายวิชา **CP353002-69 Principles of Software Design**  
> เอกสารฉบับนี้กำหนดหน้าที่ความรับผิดชอบ รายละเอียดไฟล์ และ API Endpoints สำหรับสมาชิกแต่ละคน เพื่อป้องกันปัญหา **Merge Conflict** และ **Configuration Collision** โดยสิ้นเชิง

---

## ⚠️ กฎเหล็กที่ทุกคนต้องปฏิบัติตาม (Zero-Conflict Rules)

1. **ห้ามแตะหรือแก้ไขไฟล์ของเพื่อนข้ามโมดูล:** ให้ทำงานเฉพาะในไฟล์และแพ็กเกจที่ตนเองรับผิดชอบตามตารางด้านล่าง
2. **ใช้ Standard Response Wrapper เสมอ:** ทุก Controller เมธอดต้อง Return `ApiResponse<T>` จาก `com.fiwdee.common.ApiResponse`
   ```java
   return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลสำเร็จ", data));
   ```
3. **ใช้ Base Exceptions ที่เตรียมไว้:** หากเกิด Error ให้ throw `NotFoundException`, `ValidationException`, `ConflictException` หรือ `BusinessException` จาก `com.fiwdee.exception` (ระบบมี `GlobalExceptionHandler` จัดการแปลง Response อัตโนมัติแล้ว)
4. **ห้ามลบ `@Version` ใน `Booking`:** Entity `Booking` มี Optimistic Locking ห้ามลบออกเด็ดขาด
5. **Entity `Payment` เป็น Audit Record:** บันทึกแล้วห้าม UPDATE เด็ดขาด ให้เป็น Immutable History
6. **ตรวจเช็คการคอมไพล์ก่อนเปิด Pull Request ทุกครั้ง:**
   ```bash
   cd code/backend
   ./mvnw compile     # บน Linux/macOS
   mvnw.cmd compile   # บน Windows
   ```
   ต้องขึ้น **`BUILD SUCCESS`** 100% เสมอ

---

## 📌 Phase 0 (Shared Foundation) — ทำเสร็จแล้วในระบบ!

โครงสร้างส่วนกลางต่อไปนี้มีพร้อมใช้งานแล้วบนกิ่ง `develop`:
- ✅ `pom.xml` เพิ่ม JJWT (`jjwt-api`, `jjwt-impl`, `jjwt-jackson` v0.12.6) เรียบร้อย
- ✅ `com.fiwdee.common.ApiResponse<T>` พร้อม Helper Methods
- ✅ `com.fiwdee.exception.*` (`BusinessException`, `NotFoundException`, `ValidationException`, `ConflictException`, `GlobalExceptionHandler`)
- ✅ `com.fiwdee.repository.*` ครบทั้ง 18 Interfaces สืบทอด `JpaRepository<Entity, Long>`

> 💡 **ก่อนเริ่มทำงาน:** ให้ทุกคนรัน `git pull origin develop` เพื่อดึง Foundation เข้ามาก่อนแตกกิ่ง

---

## 👥 หน้าที่ความรับผิดชอบของสมาชิกแต่ละคน (Person 1 - 5)

---

### 👤 คนที่ 1 (Dev 1): Authentication, Security & User Management
> **ภาพรวม:** ดูแลระบบความปลอดภัย, การยืนยันตัวตน (JWT), การสมัครสมาชิก, การล็อกอิน, การเข้ารหัสรหัสผ่าน และหน้าจัดการรายชื่อผู้ใช้งานทั้งหมดสำหรับ Admin

* **Use Cases:** UC-01, UC-02, UC-03, UC-28 (Tasks 1.6, 2.14)
* **Entities ที่ดูแล:** `User`, `Customer`, `Receptionist`, `Owner`
* **Repositories ที่ดูแล:**
  * `UserRepository.java` (มี `findByUsername`, `findByEmail` แล้ว)
  * `CustomerRepository.java`
  * `ReceptionistRepository.java`
  * `OwnerRepository.java`
* **Services ที่ต้องสร้าง:**
  * `com.fiwdee.service.AuthService` & `com.fiwdee.service.impl.AuthServiceImpl`
    - `register(RegisterRequestDTO)` — เข้ารหัส BCrypt, แยกสร้าง Customer หรือ Role ที่ระบุ
    - `login(LoginRequestDTO)` — ตรวจสอบ credentials และคืน JWT Token
  * `com.fiwdee.service.UserService` & `com.fiwdee.service.impl.UserServiceImpl`
    - `getAdminUsersSummary()` — สรุปผู้ใช้ทั้งหมด, จำนวน online, active today, new this month
    - `getOnlineUsers()` — แสดงรายการ session ที่กำลังล็อกอิน
* **Controllers ที่ต้องสร้าง:**
  * `com.fiwdee.controller.api.AuthController`
    - `POST /api/auth/register` (Public)
    - `POST /api/auth/login` (Public)
    - `GET /api/auth/me` (Authenticated)
  * `com.fiwdee.controller.api.AdminUserController`
    - `GET /api/admin/users` (Role: OWNER)
    - `GET /api/admin/users/online` (Role: OWNER)
* **DTOs & Mappers:**
  * `dto/request/LoginRequestDTO.java`, `dto/request/RegisterRequestDTO.java`
  * `dto/response/AuthResponseDTO.java` (token, role, username, fullName)
  * `dto/response/AdminUserSummaryResponseDTO.java`, `dto/response/UserResponseDTO.java`
  * `mapper/UserMapper.java`
* **ไฟล์ความปลอดภัย (ดูแลคนเดียว):**
  * `config/SecurityConfig.java` (ปรับเป็น JWT Filter + RBAC rules เมื่อพร้อม)
  * `config/JwtTokenProvider.java`
  * `config/JwtAuthenticationFilter.java`

---

### 👤 คนที่ 2 (Dev 2): Shop Catalog, Resource Management & Master Data
> **ภาพรวม:** ดูแลข้อมูลร้านนวด, รายการบริการและราคา (พร้อมตัวเลือกระยะเวลา), ห้องนวด, ข้อมูลหมอนวด, กะการทำงาน และสร้าง Data Seeder สำหรับตั้งต้นข้อมูลร้าน

* **Use Cases:** UC-04, UC-05, UC-06, UC-23, UC-24, UC-25, UC-26, UC-27 (Tasks 1.7, 2.1, 2.2, 2.12)
* **Entities ที่ดูแล:** `Shop`, `BusinessHours`, `Service`, `ServiceDurationOption`, `Room`, `Therapist`, `TherapistSkill`, `TherapistSchedule`, `WorkShift`
* **Repositories ที่ดูแล:**
  * `ShopRepository.java`, `BusinessHoursRepository.java`
  * `ServiceRepository.java`, `ServiceDurationOptionRepository.java`
  * `RoomRepository.java`, `TherapistRepository.java`, `TherapistSkillRepository.java`
  * `TherapistScheduleRepository.java`, `WorkShiftRepository.java`
* **Services ที่ต้องสร้าง:**
  * `com.fiwdee.service.ServiceCatalogService` (ดึงรายการนวดพร้อม durationOptions)
  * `com.fiwdee.service.TherapistService` (ดึงรายชื่อหมอนวด, ทักษะ, คำนวณรายได้เบื้องต้น)
  * `com.fiwdee.service.RoomService` (จัดการสถานะห้อง, เพิ่ม/ลบ/แก้ไขห้อง)
  * `com.fiwdee.service.ShopService` (ข้อมูลร้าน, เวลาเปิด-ปิด)
* **Controllers ที่ต้องสร้าง:**
  * `com.fiwdee.controller.api.ServiceCatalogController`
    - `GET /api/services` (Public - ต้องมี `durationOptions: [{durationMinutes, price}]` ตาม Mock Frontend)
    - `GET /api/services/{id}` (Public)
  * `com.fiwdee.controller.api.TherapistController`
    - `GET /api/therapists` (Public - มีรายการทักษะและข้อมูลสรุป)
  * `com.fiwdee.controller.api.AdminResourceController` (Role: OWNER, RECEPTIONIST)
    - CRUD `/api/admin/services`
    - CRUD `/api/admin/rooms`
    - CRUD `/api/admin/therapists`
    - `GET/PUT /api/admin/shop`
* **DTOs & Mappers:**
  * `dto/response/ServiceResponseDTO.java`, `dto/response/DurationOptionDTO.java`
  * `dto/response/TherapistResponseDTO.java`, `dto/response/RoomResponseDTO.java`, `dto/response/ShopResponseDTO.java`
  * `dto/request/ServiceCreateRequestDTO.java`, `dto/request/RoomCreateRequestDTO.java`, `dto/request/TherapistCreateRequestDTO.java`
  * `mapper/ServiceMapper.java`, `mapper/TherapistMapper.java`, `mapper/RoomMapper.java`
* **งานสำคัญพิเศษ (Data Seeder):**
  * สร้าง `com.fiwdee.config.DataSeeder.java` (`CommandLineRunner`) ใส่ข้อมูลจำลองตั้งต้น:
    - ร้าน FIWDEE ข้อมูลเวลาเปิด-ปิด
    - ห้องนวด 6 ห้อง (Room 1-6)
    - หมอนวด 6 ท่าน พร้อมทักษะ
    - บริการนวด 4 แบบ (นวดไทย, นวดอโรม่า, นวดน้ำมันร้อน, นวดเท้า) พร้อม Duration Options (60/90/120 นาที)
    - บัญชี Admin/Receptionist ทดสอบ

---

### 👤 คนที่ 3 (Dev 3): Core Booking Engine & State Pattern
> **ภาพรวม:** หัวใจหลักของระบบจอง — คำนวณช่วงเวลาว่าง (Availability Engine โดยกันเวลาทำความสะอาดห้อง 15 นาที), การสร้างการจอง และจัดการวงจรชีวิตการจองตาม **GoF State Pattern**

* **Use Cases:** UC-07, UC-08 (08a, 08b, 08c), UC-09, UC-10 (Tasks 2.3, 2.4, 2.5, 2.6)
* **Entities ที่ดูแล:** `Booking` (มี `@Version` optimistic locking)
* **Repositories ที่ดูแล:**
  * `BookingRepository.java` (เขียน Query เช็ค Overlapping ของห้องและหมอนวด)
* **Design Pattern บังคับ (GoF State Pattern):**
  * แพ็กเกจ: `com.fiwdee.pattern.state`
  * `BookingState.java` (Interface: `confirm`, `checkIn`, `startService`, `complete`, `cancel`, `markNoShow`)
  * `AbstractBookingState.java` (โยน `IllegalStateException` หรือ `ValidationException` เมื่อเปลี่ยนสถานะผิดกฎ)
  * Concrete Classes:
    - `PendingState.java`
    - `ConfirmedState.java`
    - `CheckedInState.java`
    - `InServiceState.java`
    - `CompletedState.java`
    - `CancelledState.java`
    - `NoShowState.java`
* **Services ที่ต้องสร้าง:**
  * `com.fiwdee.service.AvailabilityService`
    - `checkAvailability(LocalDate date, Long serviceId, Integer durationMinutes)`
    - ตรวจสอบห้องที่ว่าง + หมอนวดที่มีทักษะตรง + กันเวลาทำความสะอาดห้อง 15 นาที (`cleaningBufferMinutes`)
  * `com.fiwdee.service.BookingService`
    - `createBooking(BookingRequestDTO)`
    - `getBookingById(Long id)`
    - `getCustomerBookings(Long customerId)`
    - `cancelBooking(Long id, String reason)`
    - `updateBookingStatus(Long id, BookingStatus newStatus)` (ขับเคลื่อนผ่าน State Pattern)
* **Controllers ที่ต้องสร้าง:**
  * `com.fiwdee.controller.api.BookingController`
    - `GET /api/bookings/availability` (Public/Customer)
    - `POST /api/bookings` (Customer)
    - `GET /api/bookings/{id}` (Customer/Staff)
    - `GET /api/bookings/my` (Customer)
    - `PATCH /api/bookings/{id}/cancel` (Customer/Staff)
    - `GET /api/admin/bookings` (Staff)
* **DTOs & Mappers:**
  * `dto/request/BookingRequestDTO.java`, `dto/response/BookingResponseDTO.java`
  * `dto/response/AvailabilityResponseDTO.java`
  * `mapper/BookingMapper.java`

---

### 👤 คนที่ 4 (Dev 4): Front-Desk Queue, Service Execution & Observer Pattern
> **ภาพรวม:** หน้าจอพนักงานต้อนรับ (Check-in, ระบบคิว Queue), หน้าจอหมอนวดเริ่มและจบบริการ (In-Service Lifecycle), ระบบรีวิว และ **GoF Observer Pattern**

* **Use Cases:** UC-12, UC-13, UC-14, UC-15, UC-16, UC-17, UC-18 (Tasks 2.7, 2.8, 2.10, 2.11)
* **Entities ที่ดูแล:** `QueueItem`, `Review`
* **Repositories ที่ดูแล:**
  * `QueueItemRepository.java`
  * `ReviewRepository.java`
* **Design Pattern บังคับ (GoF Observer Pattern):**
  * แพ็กเกจ: `com.fiwdee.pattern.observer`
  * `BookingStatusChangedEvent.java` (Spring Event: เก็บ bookingId, oldStatus, newStatus, timestamp)
  * `QueueListener.java` (`@EventListener` — เมื่อลูกค้า Check-in สำเร็จ ให้สร้างบัตรคิว `QueueItem` อัตโนมัติ)
  * `NotificationListener.java` (`@EventListener` — จำลองส่ง Notification ให้ลูกค้าและหมอนวด)
* **Services ที่ต้องสร้าง:**
  * `com.fiwdee.service.QueueService`
    - `getDailyQueue(LocalDate date)` — ดึงรายการคิวประจำวัน
    - `callNextQueue()` — เรียกคิวถัดไป
    - `updateQueueStatus(Long queueId, QueueStatus status)`
  * `com.fiwdee.service.TherapistExecutionService`
    - `getMySchedule(Long therapistId)` — หมอนวดดูคิวของตนเอง
    - `startService(Long queueId หรือ bookingId)` — หมอนวดกดเริ่มบริการ (เปลี่ยนสถานะเป็น IN_SERVICE)
    - `completeService(Long queueId หรือ bookingId)` — หมอนวดกดจบบริการ (เปลี่ยนสถานะเป็น COMPLETED)
  * `com.fiwdee.service.ReviewService`
    - `submitReview(Long bookingId, ReviewRequestDTO dto)` — บันทึกคะแนนและรีวิว (เฉพาะการจองที่ COMPLETED)
* **Controllers ที่ต้องสร้าง:**
  * `com.fiwdee.controller.api.QueueController`
    - `GET /api/admin/queue` (Receptionist/Owner)
    - `POST /api/admin/queue/call-next` (Receptionist)
    - `PATCH /api/admin/queue/{id}/status` (Receptionist)
  * `com.fiwdee.controller.api.FrontDeskController`
    - `PATCH /api/bookings/{id}/check-in` (Receptionist - trigger Check-in)
  * `com.fiwdee.controller.api.TherapistSelfController`
    - `GET /api/therapist/me/schedule` (Therapist)
    - `POST /api/therapist/queue/{id}/start` (Therapist)
    - `POST /api/therapist/queue/{id}/complete` (Therapist)
  * `com.fiwdee.controller.api.ReviewController`
    - `POST /api/bookings/{id}/review` (Customer)
* **DTOs & Mappers:**
  * `dto/response/QueueItemResponseDTO.java`
  * `dto/request/ReviewRequestDTO.java`, `dto/response/ReviewResponseDTO.java`
  * `mapper/QueueMapper.java`, `mapper/ReviewMapper.java`

---

### 👤 คนที่ 5 (Dev 5): Payment System, Strategy Pattern & Financial Reports
> **ภาพรวม:** ระบบชำระเงิน (Immutable Audit Log), การออกใบเสร็จ, การขอคืนเงิน (Refund), ระบบคิดเงินแบบ **GoF Strategy Pattern** และ Business Dashboard & Reports ของ Owner

* **Use Cases:** UC-19 (19a, 19b), UC-20, UC-21, UC-22 (Tasks 2.9, 2.13, 3.1)
* **Entities ที่ดูแล:** `Payment` (ห้าม UPDATE เด็ดขาด), `Refund`
* **Repositories ที่ดูแล:**
  * `PaymentRepository.java`
  * `RefundRepository.java`
* **Design Pattern บังคับ (GoF Strategy Pattern):**
  * แพ็กเกจ: `com.fiwdee.pattern.strategy`
  * `PaymentStrategy.java` (Interface: `processPayment(Payment payment)`, `getSupportedMethod()`)
  * Concrete Classes:
    - `CashPaymentStrategy.java` (ชำระด้วยเงินสดหน้าร้าน)
    - `QRPaymentStrategy.java` (จำลองสร้าง QR PromptPay และตรวจสอบสลิป)
    - `CardPaymentStrategy.java` (จำลองตัดบัตรเครดิต)
  * `PaymentStrategyFactory.java` (เลือก Strategy ที่ตรงกับ `PaymentMethod` ณ ตอนทำงาน)
* **Services ที่ต้องสร้าง:**
  * `com.fiwdee.service.PaymentService`
    - `processPayment(PaymentRequestDTO dto)` — ตัดเงินผ่าน Strategy, บันทึก Entity `Payment` (Immutable)
    - `getReceipt(Long paymentId)` — ดึงข้อมูลใบเสร็จ
    - `processRefund(RefundRequestDTO dto)` — จัดการคืนเงินและบันทึก Entity `Refund`
  * `com.fiwdee.service.ReportService`
    - `getDashboardSummary()` — สรุปรายได้รวมวันนี้/เดือนนี้, จำนวนการจอง, ค่าคอมมิชชันหมอนวด
    - `getRevenueReport(LocalDate start, LocalDate end)`
    - `getTherapistCommissionReport(LocalDate start, LocalDate end)`
* **Controllers ที่ต้องสร้าง:**
  * `com.fiwdee.controller.api.PaymentController`
    - `POST /api/bookings/{id}/payment` (Customer / Receptionist)
    - `GET /api/payments/{id}/receipt` (Customer / Staff)
  * `com.fiwdee.controller.api.RefundController`
    - `POST /api/payments/{id}/refund` (Owner / Receptionist)
  * `com.fiwdee.controller.api.AdminReportController`
    - `GET /api/admin/reports/dashboard` (Owner)
    - `GET /api/admin/reports/revenue` (Owner)
    - `GET /api/admin/reports/commissions` (Owner)
* **DTOs & Mappers:**
  * `dto/request/PaymentRequestDTO.java`, `dto/response/PaymentResponseDTO.java`
  * `dto/request/RefundRequestDTO.java`, `dto/response/RefundResponseDTO.java`
  * `dto/response/DashboardSummaryDTO.java`, `dto/response/RevenueReportDTO.java`
  * `mapper/PaymentMapper.java`, `mapper/ReportMapper.java`

---

## 🗺️ File Ownership Matrix (ตารางตรวจสอบไฟล์เพื่อ Zero Conflict)

| โฟลเดอร์ / แพ็กเกจ | Dev 1 (Auth) | Dev 2 (Catalog) | Dev 3 (Booking) | Dev 4 (Queue) | Dev 5 (Payment) |
|---|:---:|:---:|:---:|:---:|:---:|
| `controller/api/` | `AuthController`<br>`AdminUserController` | `ServiceCatalogController`<br>`TherapistController`<br>`AdminResourceController` | `BookingController` | `QueueController`<br>`FrontDeskController`<br>`TherapistSelfController`<br>`ReviewController` | `PaymentController`<br>`RefundController`<br>`AdminReportController` |
| `service/` & `impl/` | `AuthService`<br>`UserService` | `ServiceCatalogService`<br>`TherapistService`<br>`RoomService`<br>`ShopService` | `AvailabilityService`<br>`BookingService` | `QueueService`<br>`TherapistExecutionService`<br>`ReviewService` | `PaymentService`<br>`ReportService`<br>`RefundService` |
| `pattern/` | - | - | **`state/*`** *(State Pattern)* | **`observer/*`** *(Observer Pattern)* | **`strategy/*`** *(Strategy Pattern)* |
| `repository/` | `User*`<br>`Customer*`<br>`Receptionist*`<br>`Owner*` | `Shop*`, `BusinessHours*`<br>`Service*`, `ServiceDuration*`<br>`Room*`, `Therapist*`<br>`TherapistSkill*`, `Shift*` | `BookingRepository` | `QueueItemRepository`<br>`ReviewRepository` | `PaymentRepository`<br>`RefundRepository` |
| `dto/` & `mapper/` | `Auth*`, `User*` | `Service*`, `Room*`<br>`Therapist*`, `Shop*` | `Booking*`, `Availability*` | `Queue*`, `Review*` | `Payment*`, `Refund*`<br>`Report*`, `Dashboard*` |
| `config/` | `SecurityConfig`<br>`Jwt*` | `DataSeeder` | - | - | - |

*(จะเห็นได้ว่าไม่มีไฟล์ใดทับซ้อนกันเลยระหว่างสมาชิกทั้ง 5 คน)*

---

## 🛠️ Git Commands Cheat Sheet สำหรับทุกคนในทีม

### 1. เริ่มต้นวันแรก: อัปเดตโค้ดและสร้าง Branch ของตนเอง
```bash
# 1. สลับไปกิ่ง develop และดึง Phase 0 ล่าสุด
git checkout develop
git pull origin develop

# 2. แตก Branch ของตนเองตามข้อกำหนด: ชื่อ_รหัสนศ_sec (ตัวอย่างเช่น chakrit_673380265-8_sec2 หรือ viphu_673380291-7_sec2)
git checkout -b <ชื่อ_รหัสนศ_sec>
```

### 2. ระหว่างเขียนโค้ด: ตรวจสอบและ Commit
```bash
# เช็คสถานะไฟล์
git status

# แอดไฟล์และ Commit
git add .
git commit -m "feat(module): your clear message here"
```

### 3. ก่อนเปิด Pull Request (สำคัญมาก!): Rebase & Compile Test
```bash
# 1. ดึงโค้ดล่าสุดจาก develop มาทับกิ่งตนเอง
git fetch origin
git rebase origin/develop

# 2. ทดสอบคอมไพล์ backend (ต้อง BUILD SUCCESS)
cd code/backend
./mvnw compile      # macOS / Linux
mvnw.cmd compile    # Windows

# 3. Push ขึ้น GitHub แล้วเปิด Pull Request
git push -u origin <branch-name>
```
