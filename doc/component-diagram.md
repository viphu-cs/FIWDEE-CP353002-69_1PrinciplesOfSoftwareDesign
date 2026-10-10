# FIWDEE Massage Management & Booking System
## UML Component Diagram Specification

---

## 1. Executive Summary & Purpose

เอกสารฉบับนี้จัดทำขึ้นเพื่อนำเสนอ **UML Component Diagram Specification ฉบับสมบูรณ์** สำหรับระบบ **FIWDEE Massage Management & Booking System** เพื่อแสดงให้เห็นถึงการจัดแบ่งโครงสร้างระบบซอฟต์แวร์ออกเป็นโมดูลและคอมโพเนนต์ย่อย (Software Components), การกำหนดส่วนต่อประสาน (Provided & Required Interfaces), ทิศทางการพึ่งพา (Component Dependencies), และการเชื่อมต่อระหว่างระบบย่อย (Subsystems) 

โดยเชื่อมโยงกับเอกสารสถาปัตยกรรมหลักของโครงการ:
1. [Domain Model Specification (`doc/domain-model.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/domain-model.md)
2. [Class Diagram Architecture (`doc/class-diagram.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/class-diagram.md)
3. [Design Patterns Specification (`doc/design-patterns.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/design-patterns.md)
4. [SOLID Principles Analysis (`doc/solid-analysis.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/solid-analysis.md)

* ไฟล์นิยาม PlantUML: [component-diagram.puml](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/diagrams/component-diagram.puml)

---

## 2. Component Architecture Overview

ระบบ FIWDEE แบ่งออกเป็น **4 Subsystems หลัก** ตามหลักการ Layered Architecture และ Separation of Concerns (SoC):

```
┌────────────────────────────────────────────────────────────────────────┐
│                   1. PRESENTATION SUBSYSTEM (CLIENT)                   │
│   React SPA (Customer Web App, Staff Back-Office, ApiClient, State)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON (REST API + JWT Bearer)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   2. API & GATEWAY SUBSYSTEM (WEB)                     │
│          Nginx Reverse Proxy, Spring Security Filter & RBAC            │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Method Calls / DTO Mappings
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                3. BUSINESS APPLICATION SUBSYSTEM (CORE)                │
│  Booking Engine, Availability, Payment/Discount Strategy, State, Event │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Spring Data JPA / HikariCP
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   4. DATA PERSISTENCE SUBSYSTEM (DB)                   │
│            18 Repositories, PostgreSQL Database (18 Tables)            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Component Diagram (Mermaid)

```mermaid
graph TB
    subgraph PresentationTier ["1. Presentation Subsystem (React 19 Frontend)"]
        CustomerUI["«component»<br>Customer Portal<br>(Landing, Booking Wizard, Profile)"]
        StaffUI["«component»<br>Staff Back-Office Portal<br>(Queue, Reception, Admin, Reports)"]
        ApiClient["«component»<br>API Client & State Store<br>(apiClient, AuthContext)"]

        CustomerUI -->|uses| ApiClient
        StaffUI -->|uses| ApiClient
    end

    subgraph SecurityGatewayTier ["2. Gateway & Security Subsystem"]
        ReverseProxy["«component»<br>Nginx Web Server / Proxy<br>(Port 80/443)"]
        SecurityGateway["«component»<br>Spring Security & JWT Filter<br>(JwtAuthenticationFilter, RBAC)"]

        ApiClient -->|HTTP/REST (JSON)| ReverseProxy
        ReverseProxy -->|proxy /api/*| SecurityGateway
    end

    subgraph CoreApplicationTier ["3. Core Business Application Subsystem (Spring Boot)"]
        subgraph Controllers ["Presentation Layer (Controllers)"]
            AuthCtrl["AuthController"]
            BookingCtrl["BookingController"]
            FrontDeskCtrl["FrontDesk / QueueController"]
            TherapistCtrl["TherapistController"]
            PaymentCtrl["PaymentController / RefundController"]
            ReportCtrl["AdminReportController"]
        end

        subgraph CoreServices ["Application Layer (Services)"]
            AuthSvc["Auth & UserService"]
            BookingEngine["Booking Engine<br>(BookingService)"]
            AvailabilityEngine["Availability Engine<br>(AvailabilityService)"]
            QueueSvc["QueueService"]
            TherapistSvc["TherapistService & ExecutionService"]
            PaymentSvc["Payment & RefundService"]
            ReportSvc["ReportService"]
        end

        subgraph DesignPatternModules ["Design Pattern Modules"]
            StateModule["«component»<br>Booking State Pattern<br>(BookingStateFactory, 7 States)"]
            PayStrategyModule["«component»<br>Payment Strategy Engine<br>(StrategyFactory, Cash, QR, Card)"]
            DiscountModule["«component»<br>Discount Strategy Engine<br>(DiscountFactory, FIWDEE20)"]
            ObserverModule["«component»<br>Event Observer Subsystem<br>(NotificationListener, QueueListener)"]
        end

        SecurityGateway --> Controllers
        AuthCtrl --> AuthSvc
        BookingCtrl --> BookingEngine
        FrontDeskCtrl --> QueueSvc
        TherapistCtrl --> TherapistSvc
        PaymentCtrl --> PaymentSvc
        ReportCtrl --> ReportSvc

        BookingEngine --> AvailabilityEngine
        BookingEngine --> StateModule
        BookingEngine -->|publishes BookingStatusChangedEvent| ObserverModule
        ObserverModule -->|triggers queue item| QueueSvc
        PaymentSvc --> PayStrategyModule
        PaymentSvc --> DiscountModule
    end

    subgraph PersistenceTier ["4. Persistence Subsystem (JPA & Database)"]
        Repositories["«component»<br>Spring Data JPA Repositories<br>(18 Interfaces: BookingRepo, RoomRepo, ...)"]
        Database[("«database»<br>PostgreSQL Relational DB<br>(18 Normalized Tables)")]

        CoreServices --> Repositories
        Repositories -->|JDBC / SQL| Database
    end
```

---

## 4. รายละเอียดของคอมโพเนนต์หลัก (Detailed Component Descriptions)

### 4.1 Presentation Subsystem (Frontend Client)
- **Customer Portal Component:** ส่วนติดต่อผู้ใช้สำหรับลูกค้าทั่วไป รองรับการดูข้อมูลบริการ, ดูความชำนาญของหมอนวด, ระบบจองห้องนวด (Step-by-step Booking Wizard), หน้าประวัติการจองของฉัน (`#my-bookings`), และหน้าแก้ไขโปรไฟล์ส่วนตัว (`#profile`)
- **Staff Back-Office Portal Component:** ระบบบริหารจัดการสำหรับพนักงานต้อนรับ (Receptionist), หมอนวด (Therapist), และเจ้าของร้าน (Owner) ประกอบด้วยหน้าคิวประจำวันหน้าร้าน (`#admin/queue`), หน้าปฏิทินนัดหมาย (`#admin/bookings`), หน้ารายชื่อผู้ใช้งานพร้อมระบบบังคับออกจากระบบ (`#admin/users`), และรายงานรายได้ประจำวัน/เดือน
- **API Client & State Store Component:** คอมโพเนนต์ตัวกลางจัดการ HTTP Request/Response โดยดึง JWT Bearer Token จาก LocalStorage แนบใน Header อัตโนมัติ (`apiClient`) พร้อม Context สำหรับตรวจเช็ค Role สิทธิ์การเข้าถึง (`CustomerAuthContext`, `AdminAuthContext`)

### 4.2 Gateway & Security Subsystem
- **Nginx Reverse Proxy:** ให้บริการ Static Content (HTML, CSS, JS) และทำหน้าที่ Reverse Proxy ส่งต่อคำขอขึ้นต้นด้วย `/api/` และ `/swagger-ui/` ไปยังเซิร์ฟเวอร์ Spring Boot ภายใน
- **Spring Security & JWT Filter Component:** ตัวกรองความปลอดภัยระดับ API ทำหน้าที่ตรวจสอบความถูกต้องของ JWT Token ทุกรีเควสต์ พร้อมถอดสิทธิ์บทบาท (UserRole: `CUSTOMER`, `THERAPIST`, `RECEPTIONIST`, `OWNER`) ส่งต่อไปยัง Security Context

### 4.3 Core Business Application Subsystem (Spring Boot)
- **Core Booking Engine (`BookingService`):** ควบคุมวงจรชีวิตการจองห้องนวด บังคับใช้ Optimistic Locking (`@Version`) เพื่อป้องกันการจองซ้อนในเวลาเดียวกัน, ออกรหัสอ้างอิง `BK-yyyyMMdd-XXXXXX`, และขับเคลื่อนสถานะผ่าน State Pattern
- **Availability Engine (`AvailabilityService`):** เครื่องยนต์คำนวณช่วงเวลาว่าง (Time-Slot Availability) โดยวิเคราะห์ 4 ปัจจัยร่วมกัน: (1) เวลาเปิด-ปิดร้าน, (2) กะการทำงานของหมอนวด, (3) ทักษะของหมอนวดที่ตรงกับบริการ, และ (4) เวลาทำความสะอาดห้อง 15 นาที (`cleaningBufferMinutes`)
- **Booking State Pattern Component:** ควบคุมกฎการเปลี่ยนสถานะทั้ง 7 ขั้นตอน (`PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `CHECKED_IN` $\rightarrow$ `IN_SERVICE` $\rightarrow$ `COMPLETED`, `CANCELLED`, `NO_SHOW`) มี Base Class `AbstractBookingState` เพื่อป้องกัน LSP Violation และบังคับว่าสถานะ `COMPLETED` ต้องชำระเงินสำเร็จก่อนเท่านั้น
- **Payment & Strategy Engine Component:** ประมวลผลการชำระเงินที่เปลี่ยนผ่านอัลกอริทึมได้ตาม `PaymentMethod` (`CashPaymentStrategy`, `QRPaymentStrategy`, `CardPaymentStrategy`) ร่วมกับ `DiscountStrategyFactory` เพื่อคำนวณโค้ดส่วนลด เช่น `FIWDEE20` (ลด 20%)
- **Event Observer Component:** จัดการความสัมพันธ์แบบหลวม (Loose Coupling) ระหว่างโมดูล เมื่อการจองเปลี่ยนสถานะ จะ Publish `BookingStatusChangedEvent` เพื่อให้ `NotificationListener` (ส่งแจ้งเตือน/บันทึก Log แบบ Asynchronous) และ `QueueListener` (สร้างบัตรคิวเมื่อลูกค้า Check-In) ทำงานอัตโนมัติ

### 4.4 Data Persistence Subsystem
- **Spring Data JPA Repositories:** คอมโพเนนต์การเชื่อมต่อฐานข้อมูลที่แยกย่อยตามหลัก Interface Segregation (ISP) ทั้ง 18 อินเทอร์เฟซ จัดการ Query เฉพาะด้าน เช่น `findActiveBookingsByRoomAndPeriod`
- **PostgreSQL Relational Database:** แหล่งจัดเก็บข้อมูลหลักที่ออกแบบตามมาตรฐาน 3NF (18 Tables) รักษา Referential Integrity ผ่าน Foreign Keys, Unique Constraints (เช่น email, phone, booking reference code) และ Concurrency Lock Column

---

## 5. ตารางสรุป Provided & Required Interfaces

| Component | Provided Interface (สิ่งที่ให้บริการผู้อื่น) | Required Interface (สิ่งที่ต้องพึ่งพา) |
| :--- | :--- | :--- |
| **BookingController** | `REST API: /api/bookings/**` (JSON) | `BookingService`, `BookingMapper` |
| **BookingService** | Java Interface: `BookingService` | `BookingRepository`, `AvailabilityService`, `BookingStateFactory`, `ApplicationEventPublisher` |
| **AvailabilityService** | Java Interface: `AvailabilityService` | `RoomRepository`, `TherapistRepository`, `TherapistSkillRepository`, `BookingRepository`, `BusinessHoursRepository` |
| **PaymentService** | Java Interface: `PaymentService` | `PaymentStrategyFactory`, `DiscountStrategyFactory`, `PaymentRepository`, `BookingRepository` |
| **PaymentStrategyFactory** | `PaymentStrategy getStrategy(PaymentMethod)` | `List<PaymentStrategy>` (Spring IoC) |
| **QueueListener** | `@EventListener(BookingStatusChangedEvent)` | `QueueService` |
| **Repository Layer** | Spring Data JPA Method Contracts | Database Driver (JDBC / PostgreSQL Connection) |

---

## 6. สรุปความสอดคล้องกับหลักการออกแบบ (Design Principles Compliance)

1. **High Cohesion & Low Coupling:** แต่ละคอมโพเนนต์จับกลุ่มคลาสที่ทำงานสอดคล้องกันอย่างใกล้ชิด (เช่น กลุ่มคำนวณเวลาว่าง, กลุ่มชำระเงิน) และเชื่อมต่อข้ามคอมโพเนนต์ผ่าน Interface และ Application Events เท่านั้น
2. **Encapsulation:** คอมโพเนนต์ภายนอกไม่สามารถเข้าถึงฐานข้อมูลโดยตรงได้ ต้องผ่าน Service Layer ที่มี Transaction และ Security Rules ควบคุม
3. **Pluggability (OCP):** กลยุทธ์การชำระเงิน ส่วนลด และ Event Listener สามารถถอดเข้าออกหรือเพิ่มใหม่ได้โดยไม่ต้องคอมไพล์คอมโพเนนต์อื่นใหม่
