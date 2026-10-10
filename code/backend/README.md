# FIWDEE Backend - Massage Management & Booking System

ระบบบริการจัดการร้านนวดและระบบจองคิวออนไลน์ **FIWDEE** พัฒนาด้วย **Java 17/23** และ **Spring Boot** ให้บริการ REST API สำหรับ **React Frontend Client** พร้อมด้วยการนำ **GoF Design Patterns** มาประยุกต์ใช้งาน

---

## 📁 โครงสร้างโฟลเดอร์และแพ็กเกจ (Package Structure)

```
code/backend/src/main/java/com/fiwdee/
├── FiwdeeApplication.java                    # Main Spring Boot Entrypoint
├── package-info.java
│
├── config/                                   # 1. APPLICATION CONFIGURATIONS
│   ├── SecurityConfig.java                   # Spring Security & JWT Configuration
│   ├── WebConfig.java                        # CORS & Web MVC Configuration (สำหรับ React Frontend)
│   ├── JpaConfig.java                        # JPA Auditing & Database Configuration
│   └── OpenApiConfig.java                    # Swagger / OpenAPI 3.0 Documentation
│
├── controller/                               # 2. CONTROLLER LAYER
│   └── api/                                  # REST API Controllers สำหรับ React (@RestController)
│       ├── BookingController.java
│       ├── PaymentController.java
│       ├── QueueController.java
│       ├── TherapistController.java
│       ├── RoomController.java
│       ├── CustomerController.java
│       ├── ServiceController.java
│       └── AuthController.java
│
├── service/                                  # 3. SERVICE LAYER (Business Interfaces & Workflows)
│   ├── BookingService.java
│   ├── PaymentService.java
│   ├── QueueService.java
│   ├── TherapistService.java
│   ├── RoomService.java
│   ├── CustomerService.java
│   └── impl/                                 # Service Implementations (Business Logic)
│       ├── BookingServiceImpl.java
│       ├── PaymentServiceImpl.java
│       ├── QueueServiceImpl.java
│       └── TherapistServiceImpl.java
│
├── repository/                               # 4. REPOSITORY LAYER (Spring Data JPA)
│   ├── BookingRepository.java
│   ├── PaymentRepository.java
│   ├── QueueItemRepository.java
│   ├── RoomRepository.java
│   ├── ServiceRepository.java
│   ├── TherapistRepository.java
│   ├── TherapistScheduleRepository.java
│   └── UserRepository.java
│
├── domain/                                   # 5. DOMAIN LAYER (Business Entities & Enums)
│   ├── entity/                               # 18 JPA Domain Entities
│   │   ├── Booking.java, Payment.java, Room.java, Therapist.java, Customer.java, ...
│   └── enums/                                # 9 Business Enums
│       ├── BookingStatus.java, PaymentMethod.java, PaymentStatus.java, QueueStatus.java, ...
│
├── dto/                                      # 6. DATA TRANSFER OBJECTS (API Contracts)
│   ├── request/                              # Request Payloads (รับ JSON จาก React)
│   │   ├── BookingRequestDTO.java, PaymentRequestDTO.java, ...
│   └── response/                             # Response Payloads (ส่ง JSON กลับไปยัง React)
│       ├── BookingResponseDTO.java, PaymentResponseDTO.java, QueueItemResponseDTO.java, ...
│
├── mapper/                                   # 7. MAPPER LAYER (DTO <-> Entity Conversion)
│   ├── BookingMapper.java
│   ├── PaymentMapper.java
│   └── ...
│
├── pattern/                                  # 8. BEHAVIORAL DESIGN PATTERNS
│   ├── state/                                # State Pattern (Booking Lifecycle 7 States)
│   ├── strategy/                             # Strategy Pattern (Payment Methods & Strategy Factory)
│   └── observer/                             # Observer Pattern (Domain Event Publishing & Listeners)
│
├── exception/                                # 9. EXCEPTION HANDLING
│   ├── ResourceNotFoundException.java
│   ├── BadRequestException.java
│   ├── InvalidStateTransitionException.java
│   └── GlobalExceptionHandler.java           # @RestControllerAdvice ส่ง JSON Error Response
│
└── common/                                   # 10. COMMON UTILITIES & CONSTANTS
    ├── AppConstants.java
    └── DateTimeUtil.java
```

---

## 🧪 โครงสร้าง Unit & Integration Tests

```
code/backend/src/test/java/com/fiwdee/
├── FiwdeeApplicationTests.java               # Spring Boot Context Load Test
├── controller/api/                           # Controller REST API Tests (@WebMvcTest)
├── service/                                  # Service Layer Business Logic Tests
├── repository/                               # JPA Repository Data Access Tests (@DataJpaTest)
├── domain/entity/                            # Entity Invariants & Methods Tests
└── pattern/                                  # Design Patterns Unit Tests
    ├── state/                                # State Transition Invariant Tests
    ├── strategy/                             # Payment Strategy Calculation Tests
    └── observer/                             # Event Publishing & Listener Tests
```

---

## 🚀 คำสั่งการใช้งาน (Commands)

### 1. ตรวจสอบและ Validate
```powershell
.\mvnw.cmd validate
```

### 2. Compile โค้ดทั้งหมด
```powershell
.\mvnw.cmd clean compile
```

### 3. รัน Tests ทั้งหมด
```powershell
.\mvnw.cmd test
```

### 4. รัน Backend API Server
```powershell
.\mvnw.cmd spring-boot:run
```
