# Test Report – FIWDEE Massage Management & Booking System

ระบบผ่านการทดสอบครบทั้ง 567 เคส (Unit Test 388 เคส + Integration Test 179 เคส) ผลผ่าน 100% ไม่มีเคส Fail, No run หรือ Block และ defect ทั้ง 17 รายการที่พบระหว่างทดสอบถูกแก้และ retest ผ่านแล้ว

| รายการ | รายละเอียด |
| --- | --- |
| รายวิชา | CP353002 Principles of Software Design and Development |
| ผู้ทดสอบ | Piyachayanin (รหัสนักศึกษา 673380049-4) |
| วันที่ทดสอบ | Unit Test 9 ต.ค. 2026 • Integration Test 10 ต.ค. 2026 |
| ข้อมูลอ้างอิง | `FIWDEE_UnitTest_Design.xlsx`, `FIWDEE_IntegrationTest_Design.xlsx` |
| โค้ดที่ทดสอบ | `code/backend` (Spring Boot 4.1.1, Java 17) branch develop |

## 1. สรุปผลการทดสอบ

| ระดับการทดสอบ | จำนวนชุดทดสอบ | จำนวนเคส | Pass | Fail | No run | Block | อัตราผ่าน |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Unit Test | 36 | 388 | 388 | 0 | 0 | 0 | 100% |
| Integration Test | 12 | 179 | 179 | 0 | 0 | 0 | 100% |
| **รวม** | **48** | **567** | **567** | **0** | **0** | **0** | **100%** |

## 2. ขอบเขตและสภาพแวดล้อม

| หัวข้อ | Unit Test | Integration Test |
| --- | --- | --- |
| สิ่งที่ทดสอบ | Service, State Pattern, Strategy Pattern, Mapper, JWT แยกทีละคลาส | Controller → Service → Repository → PostgreSQL ต่อกันจริง รวม Security และ Observer |
| เครื่องมือ | JUnit 5, Mockito (mock repository และ dependency) | Spring Boot Test, MockMvc, PostgreSQL 16 (Docker) ฐาน `fiwdee_test`, Mockito Spy/Stub บางจุด |
| ข้อมูลตั้งต้น | `TestData` ในโค้ดเทสต์ | `ItBaselineSeeder` (owner, receptionist, therapist1–6, Room 1–6, บริการ 4 รายการ) |
| คำสั่งรัน | `mvnw test -Dtest=UT*` | `mvnw test -Dgroups=integration` |
| เครื่องที่ใช้ | Lenovo LOQ 15AHP11, AMD Ryzen 7 250, RAM 16 GB DDR5, Windows 11 | เครื่องเดียวกัน + Docker Desktop |

เทคนิคที่ใช้ออกแบบ test case: Equivalence Class (Weak Normal, Weak Robust, Strong Normal), Boundary Value / Robustness, Decision Table (Limited และ Extended Entry), State Transition Table และ Scenario-based สำหรับ end-to-end

## 3. ผล Unit Test แยกตามชุดทดสอบ

| กลุ่ม | ชุดทดสอบ | เทคนิค | เคส | Pass |
| --- | --- | --- | --- | --- |
| Booking | **UT01** BookingServiceImpl.createBooking – ข้อมูลนำเข้าและผู้ทำรายการ | Weak Robust Equivalence Class Testing | 15 | 15 |
| Booking | **UT02** BookingServiceImpl.createBooking – จัดสรรหมอนวดและห้อง | Decision Table (Limited Entry) | 10 | 10 |
| Booking | **UT03** BookingServiceImpl.createBooking – ช่วงเวลาที่จองได้ | Robustness Testing | 13 | 13 |
| Booking | **UT04** BookingRepository.findConflictingRoomBookingsWithCleaningBuffer + createBooking – เวลาทับซ้อน | Robustness Testing (ขอบด้านเดียว) | 13 | 13 |
| Booking | **UT05** BookingServiceImpl.cancelBooking – ยกเลิกการจอง | Decision Table (Extended Entry) | 12 | 12 |
| Booking | **UT06** BookingServiceImpl.cancelBooking – กฎลูกค้ายกเลิกล่วงหน้า ≥ 2 ชั่วโมง | Robustness Testing (ขอบด้านเดียว) | 5 | 5 |
| Booking | **UT07** BookingServiceImpl.getBookingById – สิทธิ์การดูรายการจอง | Decision Table (Limited Entry) | 8 | 8 |
| Booking | **UT08** Booking State Pattern (Booking.confirm/checkIn/startService/complete/cancel/markNoShow) | Decision Table (Extended Entry) แบบ State Transition Table | 45 | 45 |
| Booking | **UT09** BookingStateFactory.getState(BookingStatus) | Strong Normal Equivalence Class Testing (ทุกค่าใน enum) | 8 | 8 |
| Booking | **UT10** AvailabilityServiceImpl.checkAvailability – จำนวนรอบเวลาตามระยะเวลาบริการ | Robustness Testing | 8 | 8 |
| Booking | **UT11** AvailabilityServiceImpl.checkAvailability – สภาพร้านและทรัพยากร | Weak Robust Equivalence Class Testing | 9 | 9 |
| Booking | **UT12** BookingMapper (toMyBookingResponse / toBookingResponse / list) | Weak Normal Equivalence Class Testing | 8 | 8 |
| Payment | **UT13** PaymentServiceImpl.processPayment – ตรวจเงื่อนไขและผลการชำระ | Decision Table (Limited Entry) | 8 | 8 |
| Payment | **UT14** PaymentServiceImpl.processPayment – ส่วนลดและสถานะ booking หลังชำระ | Weak Robust Equivalence Class Testing | 11 | 11 |
| Payment | **UT15** FixedAmountDiscountStrategy (WELCOME100) | Robustness Testing | 14 | 14 |
| Payment | **UT16** PercentageDiscountStrategy (FIWDEE20) | Weak Robust Equivalence Class Testing | 9 | 9 |
| Payment | **UT17** DiscountStrategyFactory.findStrategy(promoCode) | Weak Robust Equivalence Class Testing | 8 | 8 |
| Payment | **UT18** PaymentStrategyFactory + Cash/QR/CardPaymentStrategy | Strong Normal Equivalence Class Testing (ทุกค่าใน PaymentMethod) | 10 | 10 |
| Refund | **UT19** RefundServiceImpl.processRefund – จำนวนเงินคืน | Robustness Testing | 7 | 7 |
| Refund | **UT20** RefundServiceImpl – เงื่อนไขอื่นของการคืนเงิน | Weak Robust Equivalence Class Testing | 10 | 10 |
| Queue | **UT21** QueueServiceImpl.checkInBooking – ช่วงเวลาที่ check-in ได้ | Robustness Testing (ขอบด้านเดียว) | 6 | 6 |
| Queue | **UT22** QueueServiceImpl – สถานะ booking ตอน check-in และเลขคิว | Weak Robust Equivalence Class Testing | 10 | 10 |
| Queue | **UT23** QueueServiceImpl.updateQueueStatus – การเปลี่ยนสถานะคิว | Decision Table (Extended Entry) แบบ State Transition Table | 26 | 26 |
| Queue | **UT24** TherapistExecutionServiceImpl – เริ่ม/จบการให้บริการ | Decision Table (Extended Entry) | 8 | 8 |
| Review | **UT25** ReviewServiceImpl.submitReview – คะแนน 3 ด้าน | Robustness Testing | 19 | 19 |
| Review | **UT26** ReviewServiceImpl.submitReview – เงื่อนไขอื่น | Weak Robust Equivalence Class Testing | 9 | 9 |
| Auth & User | **UT27** AuthServiceImpl.login | Decision Table (Limited Entry) | 7 | 7 |
| Auth & User | **UT28** AuthServiceImpl.register | Weak Robust Equivalence Class Testing | 5 | 5 |
| Auth & User | **UT29** UserServiceImpl.updateProfile | Decision Table (Limited Entry) | 8 | 8 |
| Auth & User | **UT30** UserSessionServiceImpl – สถานะออนไลน์ (หน้าต่าง 15 นาที) | Robustness Testing (ขอบด้านเดียว) | 8 | 8 |
| Auth & User | **UT31** JwtTokenProvider | Weak Robust Equivalence Class Testing | 7 | 7 |
| Admin resources | **UT32** RoomServiceImpl | Weak Robust Equivalence Class Testing | 7 | 7 |
| Admin resources | **UT33** ServiceCatalogServiceImpl | Weak Robust Equivalence Class Testing (ใช้ค่าขอบเป็นตัวแทนคลาส) | 9 | 9 |
| Admin resources | **UT34** TherapistServiceImpl.updateSchedule – กะทำงาน | Robustness Testing (ขอบด้านเดียว) | 10 | 10 |
| Admin resources | **UT35** ShopServiceImpl.updateShop – เวลาเปิด–ปิด | Robustness Testing (ขอบด้านเดียว) | 8 | 8 |
| Report | **UT36** ReportServiceImpl.getRevenueReport – ช่วงวันที่ | Robustness Testing (ขอบด้านเดียว) | 10 | 10 |

## 4. ผล Integration Test แยกตามชุดทดสอบ

| กลุ่ม | ชุดทดสอบ | เทคนิค | เคส | Pass |
| --- | --- | --- | --- | --- |
| A. Repository + PostgreSQL | **IT01** BookingRepository – query หาการจองที่ชนกัน (JPQL จริงบน PostgreSQL) | Boundary Value (Robustness, ขอบด้านเดียว) | 18 | 18 |
| A. Repository + PostgreSQL | **IT02** Repository / JPA mapping บน PostgreSQL จริง | Weak Robust Equivalence Class | 14 | 14 |
| B. API + Security | **IT03** Authentication: AuthController + JwtAuthenticationFilter + UserRepository | Weak Robust Equivalence Class | 12 | 12 |
| B. API + Security | **IT04** สิทธิ์การเข้าถึงตาม role: SecurityConfig + JwtAuthenticationFilter + Controller | Decision Table (Extended Entry: role × endpoint) | 50 | 50 |
| B. API + Security | **IT05** รูปแบบ error ของ API: Bean Validation + GlobalExceptionHandler | Weak Robust Equivalence Class | 10 | 10 |
| C. Business flow ผ่าน API + DB | **IT06** สร้างการจอง: BookingController → BookingServiceImpl → Repository ทั้ง 7 ตัว → PostgreSQL | Decision Table (Limited Entry) | 15 | 15 |
| C. Business flow ผ่าน API + DB | **IT07** ตรวจช่วงเวลาว่าง: BookingController → AvailabilityServiceImpl → BusinessHours/Skill/Room/Booking repositories | Boundary Value (จำนวนทรัพยากรที่เหลือ และเวลาปิดร้าน) | 10 | 10 |
| C. Business flow ผ่าน API + DB | **IT08** ยกเลิกการจอง: BookingController → BookingServiceImpl → State Pattern → PostgreSQL | Decision Table (Limited Entry) | 8 | 8 |
| C. Business flow ผ่าน API + DB | **IT09** ชำระเงินและคืนเงิน: Payment/RefundController → Service → Strategy (ของจริง) → PostgreSQL | Weak Robust Equivalence Class (+ Stub ที่ Payment Strategy) | 15 | 15 |
| C. Business flow ผ่าน API + DB | **IT10** Check-in และคิว: FrontDesk/QueueController → QueueServiceImpl → Event → QueueListener (Observer) → PostgreSQL | Weak Robust Equivalence Class (+ Spy ที่ QueueListener) | 11 | 11 |
| D. End-to-end scenario | **IT11** Flow ทั้งระบบตาม sequence diagram (หลาย controller ต่อเนื่องกันบนฐานข้อมูลเดียว) | Scenario-based (Use-case flow) แบ่งกลุ่มแบบ Equivalence Class ของเส้นทาง | 8 | 8 |
| D. End-to-end scenario | **IT12** ผลของการตั้งค่าหลังบ้านต่อการจอง: AdminResourceController → Room/Service/Therapist/Shop service → Booking/Availability | Weak Robust Equivalence Class (ข้ามโมดูล) | 8 | 8 |

## 5. Defect ที่พบและสถานะ

พบ defect 17 รายการ: 10 รายการจาก Unit Test และ 7 รายการจาก Integration Test ทุกเคสที่ใช้ยืนยัน defect เหล่านี้ (tag `known-defect`) ผ่านในรอบล่าสุด จึงถือว่าแก้แล้ว

### 5.1 จาก Unit Test

| Defect | เรื่อง | Severity | Priority | เคสที่ยืนยัน | ผล retest |
| --- | --- | --- | --- | --- | --- |
| DEF-001 | จองหมอนวดนอกกะทำงานได้ (ตรวจแค่ isDayOff) | High | High | UT02-TC002 | แก้แล้ว – Pass |
| DEF-002 | createBooking ไม่ตรวจเวลา: จองย้อนหลัง, จองกระชั้นกว่า 30 นาที, เกิน 14 วัน, นอกเวลาทำการได้ | High | High | UT03-TC002, TC007, TC008, TC013 | แก้แล้ว – Pass |
| DEF-003 | ยกเลิก booking ที่จ่ายเงินแล้วไม่ส่งเข้ากระบวนการคืนเงิน | Medium | Medium | UT05-TC007 | แก้แล้ว – Pass |
| DEF-004 | cancelBooking / updateBookingStatus ไม่ publish BookingStatusChangedEvent | Low | Medium | UT05-TC005 | แก้แล้ว – Pass |
| DEF-005 | เปลี่ยนเป็น NO_SHOW ได้ทันทีโดยไม่ตรวจว่าเลยเวลานัด 15 นาที | Medium | Medium | UT08 เคสสุดท้าย | แก้แล้ว – Pass |
| DEF-006 | checkAvailability คืนรอบเวลาผิดเมื่อ durationMinutes ยาวจนเวลาวนข้ามเที่ยงคืน | Low | Low | UT10-TC008 | แก้แล้ว – Pass |
| DEF-007 | Booking ที่ COMPLETED ยังล็อกห้องและหมอนวด | Low | Low | UT11-TC006 | แก้แล้ว – Pass |
| DEF-008 | ชำระเงินตอน CHECKED_IN แล้ว Booking กลายเป็น COMPLETED (ข้าม IN_SERVICE) | High | High | UT14-TC009 | แก้แล้ว – Pass |
| DEF-009 | เปลี่ยนสถานะ Booking ตอนชำระเงินแต่ไม่ publish BookingStatusChangedEvent | Medium | Medium | UT14-TC007, TC008 | แก้แล้ว – Pass |
| DEF-010 | รับชำระเงินของ Booking ที่ CANCELLED / NO_SHOW ได้ | Medium | Medium | UT14-TC010, TC011 | แก้แล้ว – Pass |

### 5.2 จาก Integration Test

| Defect | เรื่อง | Severity | Priority | เคสที่ยืนยัน | ผล retest |
| --- | --- | --- | --- | --- | --- |
| DEF-013 | หมอนวดกด complete แล้ว booking เป็น COMPLETED ทันทีทั้งที่ยังไม่ชำระเงิน | High | High | IT11-TC002 | แก้แล้ว – Pass |
| DEF-014 | ชำระเงินระหว่าง IN_SERVICE แล้วคิวค้าง IN_SERVICE ห้องค้าง OCCUPIED และหมอนวดกดจบงานไม่ได้ | High | High | IT11-TC003 | แก้แล้ว – Pass |
| DEF-015 | endpoint หลายตัวไม่จำกัด role ตาม Use-case Matrix | High | High | IT04 (E9, E10), IT12-TC008 | แก้แล้ว – Pass |
| DEF-016 | ลูกค้าดูข้อมูลการชำระเงินของ booking คนอื่นได้ | Medium | High | IT09-TC014 | แก้แล้ว – Pass |
| DEF-017 | จองช่วงเวลาเดียวกันพร้อมกันได้หลายรายการ (double booking) | High | Medium | IT11-TC007 | แก้แล้ว – Pass |
| DEF-018 | การชำระเงินที่ล้มเหลวไม่เหลือหลักฐานในฐานข้อมูล | Medium | Medium | IT09-TC012 | แก้แล้ว – Pass |
| DEF-019 | query parameter ผิดชนิด (enum / วันที่) ได้ 500 แทน 400 | Low | Medium | IT05-TC007, TC008 | แก้แล้ว – Pass |

| Severity | จำนวน |
| --- | --- |
| High | 7 |
| Medium | 6 |
| Low | 4 |

## 6. ข้อสังเกตเกี่ยวกับไฟล์ผลทดสอบ

ควรแก้ 4 จุดในไฟล์ Excel ให้ตรงกับผลจริงก่อนส่ง

1. **ชีต Test Summary ของ Unit Test นับเคสขาด 29 เคส**: แสดงรวม 359 เคส แต่ในชีตรายชุดมี 388 เคส สาเหตุคือสูตร `COUNTA`/`COUNTIF` ของ UT07–UT36 (ยกเว้น UT10) เริ่มนับช้าไป 1 แถว จึงไม่นับเคสแรกของแต่ละชีต (เช่น UT07 นับ `B26:B33` แต่เคสอยู่ `B25:B32`) รายงานนี้ใช้ตัวเลข 388 ที่นับจากชีตจริง
2. **Defect Status ยังเป็น Open ทุกรายการ** ทั้งที่ผลรันผ่านครบ ควรเปลี่ยนเป็น Closed (หรือ Fixed) ให้ตรงกับผล retest
3. **Fix date ของ DEF-014 ถึง DEF-019 เป็นวันที่ 11–16 ต.ค. 2026** ซึ่งเลยวันทดสอบ (10 ต.ค.) ควรใส่วันที่แก้จริง
4. **เลข defect ข้ามจาก DEF-010 ไป DEF-013**: ไม่มี DEF-011 และ DEF-012 ใน Defect Summary ทั้งสองไฟล์ ถ้าตั้งใจข้ามให้ใส่หมายเหตุไว้ ถ้าไม่ตั้งใจให้เรียงเลขใหม่

## 7. สรุปและข้อเสนอแนะ

ระบบผ่านเกณฑ์การทดสอบทั้งระดับ Unit และ Integration ครบทุกเคส และไม่มี defect ค้าง ข้อเสนอแนะสำหรับรอบถัดไป:

- รัน `mvnw test -Dtest=UT*` และ `mvnw test -Dgroups=integration` ทุกครั้งที่แก้โค้ด เพื่อจับ regression (รอบนี้เคยเจอ UT21 พังจากการแก้ DEF ชุดแรก)
- ให้ GitHub Actions (`.github/workflows/ci.yml`) รันทั้งสองชุดอัตโนมัติทุก push และ pull request
- เทสต์หลายเคสขึ้นกับเวลาปัจจุบัน (`LocalDateTime.now()`) ควรพิจารณาใช้ `Clock` ใน service เพื่อให้ทดสอบได้แน่นอนกว่าเดิม
- ยังไม่ได้ทำ System/UAT ผ่านหน้าเว็บ ถ้าต้องการต่อ ควรเริ่มจาก flow จอง → check-in → ชำระ → รีวิว
