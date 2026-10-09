# 📋 FIWDEE Project Checklist — ตรวจสอบความคืบหน้าตามใบงานรายวิชา CP353002

> **อ้างอิงจาก:** *ใบงานโปรเจค_ CP353002 Principles of Software Design and Development (Spring Boot).docx*  
> **โครงการ:** FIWDEE — Massage Management & Booking System  
> **สถานะการอัปเดตล่าสุด:** 2026-10-09  

---

## 📊 1. ตารางสรุปภาพรวมสถานะตามข้อกำหนดใบงาน

| หัวข้อตามใบงาน | น้ำหนัก/ความสำคัญ | สถานะปัจจุบัน | เปอร์เซ็นต์ความพร้อม | สรุปสิ่งที่ต้องทำต่อ |
|---|:---:|:---:|:---:|---|
| **1. Technical Requirements** | บังคับ | 🟢 สมบูรณ์ | 95% | นำระบบขึ้น Cloud Server |
| **2. Layered Architecture** | บังคับ | 🟢 สมบูรณ์ | 100% | ครบทุก Layer (Controller, Service, Repository, Entity, DTO, Mapper) |
| **3. SOLID Principles** | บังคับ | 🟡 มีบางส่วน | 70% | จัดทำเอกสาร `doc/solid-analysis.md` ระบุคลาสและบรรทัด |
| **4. Design Patterns** | บังคับ | 🟢 สมบูรณ์ | 95% | GoF Behavioral ครบ 3 รูปแบบ (State, Strategy, Observer) |
| **5. Database Requirements** | บังคับ | 🟡 มีบางส่วน | 80% | ทำ Migration Script (`schema.sql` + `data.sql` หรือ Flyway) |
| **6. REST API Requirements** | บังคับ | 🟢 สมบูรณ์ | 100% | มี Pagination, Sorting และ Swagger UI ครบถ้วน |
| **7. Testing (JUnit 5 + Mockito)** | บังคับ | 🟡 มีบางส่วน | 35% | มี Pagination Unit Test ผ่านแล้ว, เพิ่ม Service Tests อื่นๆ |
| **8. Git Workflow & ยอด Commit** | บังคับ | 🟡 มีบางส่วน | 70% | สมาชิกบางท่านต้อง Commit เพิ่มให้ครบอย่างน้อย 15 ครั้ง |
| **9. โครงสร้างโฟลเดอร์ Repository** | บังคับ | 🟡 มีบางส่วน | 75% | เพิ่มโฟลเดอร์ `test/` ที่ root และ `doc/slide/` |
| **10. เอกสาร Diagrams** | บังคับ | 🟡 มีบางส่วน | 70% | เพิ่ม Component, Deployment และ State Diagram แยก |
| **11. ข้อกำหนด README.md** | บังคับ | 🔴 รอดำเนินการ | 20% | เขียน README.md ให้ครบทั้ง 11 หัวข้อตามแม่แบบใบงาน |
| **12. Deployment & Cloud DB** | บังคับ | 🔴 รอดำเนินการ | 25% | นำระบบขึ้น Cloud ให้มี Public URL ที่ใช้งานได้จริง |
| **13. Frontend Integration** | บังคับ | 🟡 กำลังทำ | 55% | เชื่อมต่อหน้า Booking Wizard, Services, Therapists กับ API จริง |

---

## 2. รายละเอียด Checklist แยกตามหมวดหมู่

---

### หมวดที่ 1: ข้อกำหนดทางเทคนิค (Technical Requirements)

- [x] **Backend Framework**: Spring Boot 3.x+ / 4.x (Java 17+)
- [x] **Build Tool**: Apache Maven (`pom.xml`, `./mvnw`)
- [x] **Database**: PostgreSQL (Relational Database)
- [x] **ORM**: Spring Data JPA (Hibernate)
- [x] **Frontend**: React (React 19 + Vite 8 + Tailwind CSS)
- [x] **API Documentation**: Swagger UI / OpenAPI (`/swagger-ui.html`)
  - เพิ่ม `springdoc-openapi-starter-webmvc-ui:2.8.5` ลงใน `code/backend/pom.xml`, สร้าง `OpenApiConfig` พร้อมระบบยืนยันตัวตน JWT Bearer token, ปลดล็อคเส้นทางใน `SecurityConfig`, ตกแต่ง `@Tag` ใน Controller ครบทุกกลุ่ม และทดสอบผ่านทั้ง `OpenApiConfigTest` และรันจริงบน Docker (2026-10-09)
- [ ] **Deployment**: Deploy ขึ้น Cloud Server ใช้งานได้จริง
  - *สิ่งที่ต้องทำ*: Deploy บน Railway / Render / Fly.io / VPS พร้อม Cloud PostgreSQL (Supabase / Neon / Railway)

---

### หมวดที่ 2: สถาปัตยกรรมโปรเจค (Layered Architecture)

> **กฎเหล็ก**: แยก Layer ชัดเจน ห้ามข้าม Layer โดยเด็ดขาด (เช่น Controller ห้ามเรียก Repository ตรงๆ)

- [x] **Presentation Layer**: `com.fiwdee.controller.api.*`
  - Controller เรียกเฉพาะ Service Layer และส่งค่าคืนเป็น `ApiResponse<T>`
- [x] **Service Layer**: `com.fiwdee.service.*` และ `com.fiwdee.service.impl.*`
  - รวม Business Logic และจัดการ Transaction (`@Transactional`)
- [x] **Repository Layer**: `com.fiwdee.repository.*`
  - Spring Data JPA สืบทอด `JpaRepository<Entity, Long>` ครบ 18 Interfaces
- [x] **Domain / Entity Layer**:
  - `com.fiwdee.domain.entity.*` ครบ 18 Entities
  - `com.fiwdee.domain.enums.*` ครบ 9 Enums
- [x] **DTO & Mapper Layer**:
  - `com.fiwdee.dto.request.*` และ `com.fiwdee.dto.response.*`
  - `com.fiwdee.mapper.*` แปลงระหว่าง Entity และ DTO
- [x] **Exception & Common Layer**:
  - `GlobalExceptionHandler` (`@RestControllerAdvice`)
  - Custom Exceptions: `BusinessException`, `NotFoundException`, `ValidationException`, `ConflictException`

---

### หมวดที่ 3: SOLID Principles

- [x] **S — Single Responsibility Principle**:
  - แต่ละ Class มีหน้าที่เดียว แยก Service, Controller, Mapper, Repository อิสระจากกัน
- [x] **O — Open/Closed Principle**:
  - รองรับการขยายฟีเจอร์ด้วย Polymorphism เช่น `DiscountStrategy` (รองรับโค้ดส่วนลดใหม่โดยไม่ต้องแก้โค้ดคำนวณเดิม)
- [x] **L — Liskov Substitution Principle**:
  - คลาสย่อยของ State (`AbstractBookingState` -> `PendingState`, `ConfirmedState`, ฯลฯ) สามารถใช้แทนกันได้โดยตรรกะไม่พัง
- [x] **I — Interface Segregation Principle**:
  - แยก Interface ตามบริบท ไม่สร้าง Fat Interface เช่น `PaymentStrategy`, `DiscountStrategy`, `BookingState`
- [x] **D — Dependency Inversion Principle**:
  - ทุก Service และ Controller พึ่งพา Interface และใช้ Constructor Injection (`@RequiredArgsConstructor` / Spring DI)
- [ ] **เอกสารบังคับ**: `doc/solid-analysis.md`
  - *สิ่งที่ต้องทำ*: เขียนเอกสารระบุชื่อไฟล์, บรรทัดที่ปรากฏ, และคำอธิบายเหตุผลของแต่ละหลักการ (S, O, L, I, D)

---

### หมวดที่ 4: Design Patterns (Checklist)

#### 4.1 Enterprise / Architectural Patterns (บังคับ)
- [x] **Layered Architecture**: แบ่งชั้น Presentation -> Service -> Repository -> Domain
- [x] **MVC Pattern**: Controller / Model (DTO/Entity) / View (React Frontend)
- [x] **Repository Pattern**: จัดการ Data Access ผ่าน Spring Data JPA
- [x] **Service Layer Pattern**: กักเก็บ Business Logic ทั้งหมดไว้ใน Service
- [x] **DTO Pattern & Mapper**: แยก Entity ออกจาก API Contract ไม่ส่ง Entity ออกไปภายนอกตรงๆ
- [x] **Dependency Injection**: ใช้ Constructor Injection ผ่าน Spring Framework

#### 4.2 GoF Behavioral Patterns (ครบ 3 รูปแบบ)
- [x] **State Pattern** (`com.fiwdee.pattern.state`):
  - ควบคุมสถานะวงจรชีวิตของการจอง (`Booking`) 7 สถานะ: `Pending`, `Confirmed`, `CheckedIn`, `InService`, `Completed`, `Cancelled`, `NoShow` พร้อม `BookingStateFactory`
- [x] **Strategy Pattern** (`com.fiwdee.pattern.strategy`):
  - การชำระเงิน: `CashPaymentStrategy`, `QRPaymentStrategy`, `CardPaymentStrategy` + `PaymentStrategyFactory`
  - โปรโมชั่นส่วนลด: `PercentageDiscountStrategy` (เช่น `FIWDEE20`), `FixedAmountDiscountStrategy` + `DiscountStrategyFactory`
- [x] **Observer Pattern** (`com.fiwdee.pattern.observer`):
  - ใช้ Spring Application Event (`BookingStatusChangedEvent`) ส่งต่อไปยัง `QueueListener` (สร้างคิวอัตโนมัติเมื่อเช็คอิน) และ `NotificationListener`
- [ ] **เอกสารบังคับ**: ตารางสรุปใน `doc/design-patterns.md`
  - *สิ่งที่ต้องทำ*: ตรวจสอบว่าตารางสรุปมีคอลัมน์ครบ: *Pattern | ปัญหาที่แก้ | ไฟล์/คลาสที่ใช้ | Class Diagram ประกอบ*

---

### หมวดที่ 5: ข้อกำหนดฐานข้อมูล (Database Requirements)

- [x] **จำนวนตาราง**: มี 18 ตาราง (เกินเกณฑ์ขั้นต่ำ 6 ตาราง)
- [x] **ความสัมพันธ์ครบทุกรูปแบบ**:
  - One-to-One: `User` ↔ `Customer` / `Therapist` / `Receptionist` / `Owner` (Class Table Inheritance)
  - One-to-Many: `Shop` ↔ `BusinessHours`, `Service` ↔ `ServiceDurationOption`, `Booking` ↔ `Payment`
  - Many-to-Many (คะแนนพิเศษ): `Therapist` ↔ `Service` ผ่านตารางเชื่อม `TherapistSkill`
- [x] **Integrity & Constraints**:
  - Foreign Key Constraints, Unique Constraints (Email, Phone, Reference Codes)
  - Optimistic Locking (`@Version` ใน Entity `Booking`)
  - Immutable Financial Audit Record (Entity `Payment` และ `Refund` ห้ามแก้ไข)
- [x] **เอกสารฐานข้อมูล**: มี ER Diagram และ Data Dictionary ใน `doc/er-diagram.md`
- [ ] **Database Migration / Seed Script**:
  - *สิ่งที่ต้องทำ*: จัดทำ `schema.sql` (DDL สร้าง 18 ตาราง) และ `data.sql` (DML ข้อมูลตั้งต้นร้าน หมอนวด บริการ ห้อง) ไว้ใน `code/backend/src/main/resources/` (หรือใช้ Flyway)

---

### หมวดที่ 6: ข้อกำหนด REST API

- [x] **CRUD อย่างน้อย 2 Resource หลัก**:
  - มี CRUD ห้องนวด (`/api/admin/rooms`), บริการนวด (`/api/admin/services`), การจอง (`/api/bookings`), คิว (`/api/admin/queue`)
- [x] **HTTP Methods & Status Codes ถูกต้อง**:
  - 200 OK, 201 Created, 204 No Content, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict
- [x] **Resource-based Naming**: ออกแบบ URL ตาม REST Standard
- [x] **Global Exception Handler**: แปลง Runtime Exception เป็น JSON Response มาตรฐาน
- [x] **Bean Validation**: ตรวจสอบข้อมูลนำเข้าด้วย `@Valid`, `@NotBlank`, `@NotNull`, `@Size` ใน DTO
- [x] **Pagination & Sorting**:
  - `GET /api/admin/bookings` รองรับ `Pageable` (`page`, `size`, `sort`) พร้อมฟิลเตอร์ `date`, `status`, `search` และส่งค่าคืนเป็น `Page<BookingResponseDTO>`
  - `GET /api/admin/users/page` รองรับ `Pageable` (`page`, `size`, `sort`) พร้อมฟิลเตอร์ `role`, `search` และส่งค่าคืนเป็น `Page<UserResponseDTO>`
  - มี Unit Test `BookingServicePaginationTest` (JUnit 5 + Mockito) ทดสอบผ่าน 100%
- [x] **Swagger UI**:
  - เปิดใช้งานสำเร็จที่ `/swagger-ui.html` และ `/swagger-ui/index.html` (OpenAPI Spec ที่ `/v3/api-docs`) มี `@Tag` จัดหมวดหมู่คอนโทรลเลอร์ครบ 13 กลุ่ม พร้อมปุ่ม Authorize รองรับ Bearer JWT (2026-10-09)

---

### หมวดที่ 7: Git Workflow & กฎการทำงานกลุ่ม

- [x] **โครงสร้าง Branch**:
  - `main` (Production)
  - `develop` (Integration รวมงานทุกคน)
  - Branch ส่วนตัวตามรูปแบบที่กำหนด
- [x] **รูปแบบชื่อ Branch ส่วนตัว**: `ชื่อ_รหัสนักศึกษา_section`
  - `viphu_673380291-7_sec2`
  - `chakrit_673380265-8_sec2`
  - `Titisak_673380035-5_sec2`
  - `supached_673380063-0_sec2`
- [ ] **จำนวน Commit ต่อคน ($\ge 15$ Commits)**:
  - `viphu-cs`: 60 commits ✅ (ผ่านเกณฑ์)
  - `Chakrit`: 32 commits ✅ (ผ่านเกณฑ์)
  - `Titisak2005`: 17 commits ✅ (ผ่านเกณฑ์)
  - `supached` / `nongsaw6969`: 5 commits ⚠️ **(ต้อง commit เพิ่มอย่างน้อย 10 ครั้ง)**
  - สมาชิกคนที่ 5 (ถ้ามี): ต้องมี branch และ commit $\ge 15$ ครั้ง
- [x] **Commit Message Convention**: ใช้รูปแบบ `<type>: <description>`
- [ ] **Pull Request & Code Review**: รวมงานผ่าน PR โดยมี Reviewer ก่อนรวมเข้า `develop` และ `main`

---

### หมวดที่ 8: โครงสร้างโฟลเดอร์ของ Repository

- [x] 📁 `code/` (Source Code + Configuration: `backend/`, `frontend/`)
- [ ] 📁 `test/` (การทดสอบทั้งหมด — ปัจจุบัน test อยู่ใน `code/backend/src/test/` ต้องสร้างโฟลเดอร์ `test/` ที่ root หรือวาง Postman / Test Scripts)
- [x] 📁 `doc/` (เอกสารทางเทคนิคทั้งหมด)
- [x] 📁 `img/` (ไฟล์รูปภาพไดอะแกรมและภาพประกอบ)
- [ ] 📁 `doc/slide/` (โฟลเดอร์สำหรับวางสไลด์นำเสนอโปรเจค)

---

### หมวดที่ 9: ไดอะแกรมที่ต้องมีใน `doc/diagrams/`

- [x] **Use Case Diagram**: `doc/diagrams/use-case-diagram.puml`
- [x] **Domain Model / Conceptual Class Diagram**: `doc/diagrams/domain-model.puml`
- [x] **Class Diagram**: `doc/diagrams/class-diagram.puml` (แสดงตำแหน่ง Design Patterns)
- [x] **Sequence Diagram**: `doc/diagrams/sequence-diagram.puml` (มี 3 Scenario: จอง, คิว/เช็คอิน, ชำระเงิน)
- [x] **Activity Diagram**: `doc/diagrams/activity-diagram.puml`
- [x] **ER Diagram / Database Schema**: `doc/diagrams/er-diagram.puml`
- [ ] **Component Diagram**: ⚠️ ยังไม่มีไฟล์ใน `doc/diagrams/`
- [ ] **Deployment Diagram**: ⚠️ ยังไม่มีไฟล์ใน `doc/diagrams/`
- [ ] **State Diagram**: ⚠️ ยังไม่มีไฟล์แยกใน `doc/diagrams/` (แม้ในโค้ดมี State Pattern แล้ว)

---

### หมวดที่ 10: ข้อกำหนดเนื้อหาใน `README.md`

`README.md` ปัจจุบันมีขนาดสั้น ต้องปรับปรุงให้มีหัวข้อครบทั้ง 11 ส่วนตามที่ใบงานบังคับ:
- [ ] **1. ชื่อโปรเจค** (คำอธิบายระบบสั้นๆ 3–5 บรรทัด)
- [ ] **2. สมาชิกกลุ่ม** (ตาราง: ลำดับ, ชื่อ-นามสกุล, รหัสนักศึกษา, Section, Branch, หน้าที่รับผิดชอบ)
- [ ] **3. Tech Stack**
- [ ] **4. System Architecture**
- [ ] **5. Database Design (ER Diagram)**
- [ ] **6. Installation & Setup**
- [ ] **7. How to Run**
- [ ] **8. API Documentation** (URL Swagger)
- [ ] **9. How to Run Tests**
- [ ] **10. Deployment URL**
- [ ] **11. Project Structure**

---

### หมวดที่ 11: Deployment & Production Readiness

- [x] **Docker Configuration**: มี `Dockerfile` (Backend + Frontend) และ `docker-compose.yml`
- [ ] **Public Cloud Deployment**: ระบบเปิดใช้งานได้จริงผ่าน Public URL (เช่น Railway, Render, Fly.io)
- [ ] **Cloud Database**: เชื่อมต่อ PostgreSQL บน Cloud (Supabase, Neon, Railway)
- [ ] *(คะแนนพิเศษ)* **CI/CD Pipeline**: ตั้งค่า GitHub Actions (`.github/workflows/ci.yml`) ทดสอบและ Deploy อัตโนมัติ

---

### หมวดที่ 12: การเชื่อมต่อ Frontend กับ Backend (Frontend Integration)

- [x] **API Client & Authentication**: `src/lib/api.js` เชื่อม Bearer JWT Token
- [x] **หน้าเข้าสู่ระบบ & ลงทะเบียน (Login / Register)**: เชื่อมต่อ API จริง
- [x] **หน้าโปรไฟล์ลูกค้า (`#profile`)**: ดึงข้อมูลและอัปเดตข้อมูลจริง
- [x] **หน้าประวัติการจองของฉัน (`#my-bookings`)**: ดึงรายการการจองจากฐานข้อมูลจริง
- [x] **หน้าจัดการผู้ใช้สำหรับผู้ดูแลระบบ (`#admin/users`)**: ดึงรายชื่อ, จำนวนออนไลน์, Force Logout ผ่าน API จริง
- [ ] **หน้ารายการบริการ & หมอนวด (`#services`, `#therapists`)**: เปลี่ยนจากการใช้ `mock.js` เป็นเรียก `GET /api/services` และ `GET /api/therapists`
- [ ] **ขั้นตอนการจอง (Booking Wizard `#booking`)**: เชื่อมต่อตรวจเช็คเวลาว่าง (`availability`), บันทึกการจอง, และจำลองชำระเงินจริง
- [ ] **ระบบคิวและหน้าทำงานพนักงานต้อนรับ / หมอนวด**: เชื่อมต่อเรียกคิว, เริ่มบริการ, และจบบริการจริง

---

## 3. Checklist ด่วนก่อนส่งงาน (Final Pre-Submission Checklist)

- [ ] โฟลเดอร์ครบ 4 โฟลเดอร์หลัก: `code/`, `test/`, `doc/`, `img/`
- [ ] `README.md` มีตารางสมาชิกครบทุกคนพร้อมชื่อ Branch และข้อมูลครบ 11 หัวข้อ
- [ ] สมาชิกทุกคนมี Branch ชื่อถูกรูปแบบ (`ชื่อ_รหัสนักศึกษา_section`)
- [ ] สมาชิกทุกคนมี Commit ไม่น้อยกว่า 15 ครั้ง กระจายตามช่วงเวลาทำงาน
- [ ] รวมโค้ดเข้ากิ่ง `develop` และ `main` ผ่าน Pull Request พร้อม Code Review
- [ ] Public Deployment URL เปิดใช้งานได้จริง ณ วันนำเสนอ
- [x] Swagger UI เข้าถึงได้จริง (`http://<host>:<port>/swagger-ui.html`) ✅ (ทดสอบบน Docker และ Localhost แล้ว)
- [ ] Test ทั้งหมดรันผ่าน (`./mvnw test`) และมี Test Report
- [ ] มีเอกสาร `doc/solid-analysis.md`
- [ ] เอกสาร Diagram ครบทุกชนิดใน `doc/diagrams/` (รวม Component, Deployment, State Diagram)
- [ ] Slide นำเสนอวางไว้ใน `doc/slide/`
