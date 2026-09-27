# FIWDEE Massage Management & Booking System
## UML Activity Diagram Specification

---

## 1. Executive Summary & Purpose

เอกสารฉบับนี้จัดทำขึ้นเพื่อนำเสนอ **UML Activity Diagram Specification ฉบับสมบูรณ์ (Design-Level Business & Operational Workflow)** สำหรับระบบ **FIWDEE Massage Management & Booking System** โดยวิเคราะห์และเชื่อมโยงเอกสารสถาปัตยกรรมทั้ง 5 ฉบับของโครงการเข้าด้วยกันอย่างเคร่งครัด:

1. [Domain Model Specification (`doc/domain-model.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/domain-model.md) — **Source of Truth สำหรับ Business Entities (18 Entities), Data Types, Relationships, Multiplicities และ Business Constraints**
2. [Use Case Specification (`doc/use-case.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/use-case.md) — **Source of Truth สำหรับ Actors, Business Flows, Pre/Postconditions, Include/Extend และ Business Rules**
3. [Class Diagram Specification (`doc/class-diagram.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/class-diagram.md) — **Source of Truth สำหรับ Controllers, Services, Repositories, Domain Methods, DTOs, Mappers และ Layer Dependencies**
4. [Sequence Diagram Specification (`doc/sequence-diagram.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/sequence-diagram.md) — **Source of Truth สำหรับ Message Interactions, Parameter Passing และ State Delegation**
5. [Design Patterns Specification (`doc/design-patterns.md`)](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/design-patterns.md) — **Source of Truth สำหรับ State Pattern (LSP Compliant), Strategy Pattern, Factory Pattern, Observer Pattern, Repository Pattern และ Clean Architecture**

---

## 2. Activity Diagram หลัก: Booking & Service Lifecycle Flow (End-to-End)

แผนภาพ Activity Diagram หลักครอบคลุมวงจรชีวิตของการจองและการรับบริการนวดตั้งแต่เริ่มต้นจนสิ้นสุดกระบวนการ โดยแบ่ง Swimlanes ออกเป็น 4 ส่วน:
* **Customer:** ผู้รับบริการ (เลือบริการ, ระบุเวลา, ชำระเงิน, เช็คอิน, รับบริการ)
* **Staff (Receptionist / Therapist):** พนักงานต้อนรับและหมอนวดผู้ให้บริการ
* **System (BookingService, PaymentService, QueueService, Repositories):** แกนกลางประมวลผล Business Rules และ State Transitions
* **Payment Gateway / Bank / EDC:** ระบบประมวลผลธุรกรรมทางการเงินภายนอก

### 2.1 Diagram Source & Rendered Image
* **ไฟล์นิยาม PlantUML:** [activity-diagram.puml](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/doc/diagrams/activity-diagram.puml)
* **ไฟล์รูปภาพ PNG:** [activity-diagram-main.png](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/img/activity-diagram-main.png)

![Main Activity Diagram](../img/activity-diagram-main.png)

---

### 2.2 Mermaid Diagram Representation

```mermaid
flowchart TD
    subgraph Customer ["Customer (ผู้รับบริการ)"]
        A1([เริ่มต้น]) --> A2[เลือกบริการและระยะเวลาที่ต้องการ]
        A2 --> A3[ระบุวัน เวลา และความต้องการพิเศษ]
        A3 -. ส่งคำขอจอง .-> B1
        
        A4[เลือกช่องทางชำระเงิน<br/>PromptPay QR / Card] --> A5[ส่งคำขอชำระเงิน]
        A5 -. ส่ง Transaction .-> B4
        
        A6[เดินทางมาถึงร้านนวด] --> A7[แจ้งเช็คอินที่เคาน์เตอร์]
        A7 -. ข้อมูลการจอง .-> C1
        
        A8[นั่งรอในโซนรับรอง] --> A9[พนักงานเรียกคิว]
        A9 --> A10[เดินเข้าห้องนวดตามที่ได้รับมอบหมาย]
        
        A11[ชำระเงิน ณ เคาน์เตอร์<br/>Cash / QR / Card] -. ข้อมูลเงิน/สลิป .-> C6
        A12[รับใบเสร็จและเสร็จสิ้นบริการ] --> A13([สิ้นสุดกระบวนการ])
    end

    subgraph System ["System (ระบบ FIWDEE Backend)"]
        B1[ตรวจสอบ Service Validity<br/>ServiceRepository.findById] --> B2[ตรวจสอบ Therapist Schedule & Skills<br/>TherapistScheduleRepository, TherapistRepository]
        B2 --> B3[ตรวจสอบ Room Availability & 15-min Buffer<br/>RoomRepository.findAvailableRooms]
        
        B3 --> D1{ทรัพยากรว่าง<br/>เพียงพอหรือไม่?}
        D1 -- ไม่ว่าง (Conflict) --> E1[แจ้งเตือน 409 Conflict<br/>และแสดงช่วงเวลาว่างอื่น]
        E1 -. แสดงผล .-> A3
        
        D1 -- ว่างสมบูรณ์ --> B_Init[สร้าง Booking สถานะ PENDING]
        B_Init --> D2{ต้องชำระเงินล่วงหน้า?}
        D2 -- จองล่วงหน้าออนไลน์ --> A4
        D2 -- Walk-in / Pay Later --> B_ConfDirect[ยืนยันการจองทันที<br/>Booking.confirm -> CONFIRMED]
        B_ConfDirect --> B_Save1[บันทึก BookingRepository.save]
        B_Save1 -. แจ้งยืนยันการจอง .-> A6
        
        B4[สร้าง Payment Entity<br/>ดึง Strategy จาก PaymentStrategyFactory] --> B5[ส่งต่อ PaymentStrategy.processPayment]
        B5 -. ประมวลผล .-> P1
        
        P_Success{การชำระเงิน<br/>สำเร็จหรือไม่?}
        P_Success -- สำเร็จ --> B6[ตั้ง Payment.paymentStatus = COMPLETED<br/>PaymentRepository.save]
        B6 --> B7[ยืนยันการจอง Booking.confirm<br/>State เปลี่ยนเป็น CONFIRMED]
        B7 --> B8[บันทึก BookingRepository.save]
        B8 -. แจ้งการจองสำเร็จ .-> A6
        
        P_Success -- ล้มเหลว --> B_Fail[ตั้ง Payment.paymentStatus = FAILED<br/>Booking.cancel -> CANCELLED]
        B_Fail -. แจ้งเตือนชำระเงินล้มเหลว .-> A4
        
        C1_Check{เวลาเช็คอิน<br/>ถูกต้องตามเกณฑ์?}
        C1_Check -- มาเร็วเกิน > 30 นาที --> C1_Reject[ปฏิเสธเช็คอิน 400 Bad Request<br/>BR-QUE-01]
        C1_Check -- ตรงเวลา / ภายใน 30 นาที --> B9[Booking.checkIn<br/>State เปลี่ยนเป็น CHECKED_IN]
        C1_Check -- สายเกิน > 15 นาที --> C_LateDecision{ลูกค้ามาถึงหรือไม่?}
        
        C_LateDecision -- มาไม่ทัน / No-Show --> B_NoShow[Booking.markNoShow -> NO_SHOW<br/>คืนห้องและหมอนวด]
        C_LateDecision -- มาสายแต่พร้อมรับบริการ --> B9
        
        B9 --> B10[บันทึก BookingRepository.save]
        B9 --> B11[Publish BookingStatusChangedEvent]
        B11 --> B12_Fork1[NotificationListener ส่งแจ้งเตือนหมอนวด]
        B11 --> B12_Fork2[QueueListener สั่ง QueueService.generateQueueItem<br/>สร้าง QueueItem สถานะ WAITING]
        B12_Fork2 --> B13[QueueItemRepository.save]
        B13 -. ออกบัตรคิว .-> A8
        
        C4_Sys[Booking.startService<br/>State เปลี่ยนเป็น IN_SERVICE<br/>บันทึก actualStartTime = now] --> C4_Room[ดึง RoomRepository.findById<br/>ตั้ง Room.setRoomStatus OCCUPIED<br/>RoomRepository.save]
        C4_Room --> C4_Save[บันทึก BookingRepository.save]
        
        C5_Sys[BookingService.recordPhysicalCompletion<br/>บันทึก actualEndTime = now<br/>Booking คงสถานะ IN_SERVICE] --> C5_Room[ดึง RoomRepository.findById<br/>ตั้ง Room.setRoomStatus CLEANING<br/>RoomRepository.save]
        C5_Room --> C5_Save[บันทึก BookingRepository.save]
        
        C6_Sys{ตรวจสถานะชำระเงิน<br/>Payment == COMPLETED?}
        C6_Sys -- ยังไม่ชำระ (Pay at Counter) --> C6_Process[คำนวณยอดจาก Booking.totalPrice<br/>ประมวลผลผ่าน PaymentStrategy]
        C6_Process --> C6_Save[บันทึก Payment.paymentStatus = COMPLETED<br/>ออกใบเสร็จ REC-xxx]
        C6_Save --> C7_Complete
        
        C6_Sys -- ชำระแล้วล่วงหน้า --> C7_Complete[Booking.complete<br/>InServiceState.complete ตรวจสอบ Invariant]
        
        C7_Complete --> D_FinalPay{Payment Status == COMPLETED?}
        D_FinalPay -- ใช่ (Invariant ผ่าน) --> B14[State เปลี่ยนเป็น COMPLETED<br/>BookingRepository.save]
        B14 --> B15[Publish Event COMPLETED<br/>ส่งใบเสร็จและข้อความขอบคุณ]
        B15 -. มอบใบเสร็จ .-> A12
        
        D_FinalPay -- ไม่ใช่ --> B_Err[ปฏิเสธการจบงาน<br/>Booking คงสถานะ IN_SERVICE]
    end

    subgraph Staff ["Staff (Receptionist / Therapist)"]
        C1[ค้นหาการจองและส่งคำขอ Check-in<br/>POST /api/bookings/id/check-in] -. ตรวจสอบ .-> C1_Check
        C2[เรียกคิวถัดไป<br/>POST /api/queue/call-next] --> C3[พาลูกค้าเข้าห้องนวดที่จัดสรรไว้]
        C3 --> C4[กดเริ่มให้บริการ<br/>POST /api/bookings/id/start] -. อัปเดตระบบ .-> C4_Sys
        
        C4_Work[ให้บริการนวดตามระยะเวลาของแพ็กเกจ] --> C5[บริการทางกายภาพสิ้นสุด<br/>POST /api/bookings/id/complete-physical]
        C5 -. อัปเดตระบบ .-> C5_Sys
        
        C5_Guide[พาลูกค้าไปเคาน์เตอร์ชำระเงิน] --> C6[รับชำระเงินหน้าร้าน<br/>POST /api/payments] -. ประมวลผล .-> C6_Sys
    end

    subgraph Gateway ["Payment Gateway / Bank / EDC"]
        P1[ประมวลผลการตัดบัตรเครดิต / QR PromptPay] --> P_Success
    end
```

---

## 3. Activity Diagrams ย่อยตาม Use Cases สำคัญ

### 3.1 Check-in & Queue Management Flow (UC-12, UC-13, UC-14)
* **ไฟล์รูปภาพ PNG:** [activity-diagram-checkin-queue.png](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/img/activity-diagram-checkin-queue.png)

![Check-in & Queue Flow](../img/activity-diagram-checkin-queue.png)

```mermaid
flowchart TD
    startNode([เริ่มต้น]) --> A1[ลูกค้ามาถึงเคาน์เตอร์ต้อนรับ]
    A1 --> A2[พนักงานค้นหาข้อมูลการจองผ่าน BookingReferenceCode หรือเบอร์โทร]
    A2 --> A3[ส่งคำขอ POST /api/bookings/id/check-in]
    
    A3 --> DecisionTime{ตรวจสอบเวลาปัจจุบันเทียบกับ startDateTime}
    DecisionTime -- มาเร็วเกิน > 30 นาที --> RejectEarly[ปฏิเสธการเช็คอิน 400 Bad Request<br/>แจ้งลูกค้ารอช่วงเวลาเช็คอิน BR-QUE-01] --> endEarly([จบลำดับ])
    
    DecisionTime -- สายเกิน > 15 นาที --> CheckNoShow{ลูกค้าไม่มาจริงหรือไม่?}
    CheckNoShow -- ใช่ (No-Show) --> MarkNoShow[Booking.markNoShow -> สถานะ NO_SHOW<br/>คืนห้องนวดและหมอนวดกลับสู่ระบบ] --> endNoShow([จบลำดับ])
    CheckNoShow -- ไม่ใช่ (มาสายแต่พร้อมรับบริการ) --> AdjustTime[พนักงานปรับลดเวลาตามเวลาที่เหลือ] --> ValidCheckIn
    
    DecisionTime -- ตรงเวลา (ภายใน 30 นาทีก่อนเริ่ม) --> ValidCheckIn[Booking.checkIn<br/>ConfirmedState -> CheckedInState<br/>สถานะเปลี่ยนเป็น CHECKED_IN]
    
    ValidCheckIn --> SaveBooking[บันทึก BookingRepository.save]
    SaveBooking --> PublishEvent[Publish BookingStatusChangedEvent]
    
    PublishEvent --> ForkObserver
    subgraph ParallelObserver ["Asynchronous Event Processing"]
        ForkObserver --> Obs1[NotificationListener แจ้งเตือนหมอนวดประจำการ]
        ForkObserver --> Obs2[QueueListener เรียก QueueService.generateQueueItem<br/>สร้าง QueueItem สถานะ WAITING พร้อมเลขคิวประจำวัน]
        Obs2 --> SaveQueue[บันทึก QueueItemRepository.save]
    end
    
    SaveQueue --> IssueTicket[พิมพ์/ออกบัตรคิวให้ลูกค้า]
    IssueTicket --> WaitLounge[ลูกค้านั่งรอเรียกคิวในโซนรับรอง]
    WaitLounge --> CallQueue[พนักงานเรียกคิวผ่าน QueueController.callNextQueue<br/>สถานะคิวเป็น CALLED]
    CallQueue --> EscortRoom[พาเข้าห้องนวดและกด Start Service<br/>สถานะคิวและ Booking เป็น IN_SERVICE<br/>ห้องนวดเปลี่ยนเป็น OCCUPIED] --> endSuccess([เข้าสู่กระบวนการให้บริการ])
```

---

### 3.2 Payment Processing & Strategy Selection Flow (UC-19)
* **ไฟล์รูปภาพ PNG:** [activity-diagram-payment.png](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/img/activity-diagram-payment.png)

![Payment Flow](../img/activity-diagram-payment.png)

```mermaid
flowchart TD
    startPay([เริ่มต้นการชำระเงิน]) --> B1[พนักงานส่งคำขอ POST /api/payments]
    B1 --> B2[ดึงข้อมูลการจอง BookingRepository.findById]
    B2 --> B3[ดึงยอดเงินจาก Booking.totalPrice เป็น Domain Truth]
    B3 --> B4[สร้าง Domain Entity Payment]
    B4 --> B5[เรียก PaymentStrategyFactory.getStrategy]
    
    B5 --> DecisionMethod{เลือก PaymentMethod}
    
    DecisionMethod -- CASH --> StratCash[CashPaymentStrategy<br/>รับเงินสด ทอนเงิน บันทึกลงลิ้นชัก] --> PayResult
    DecisionMethod -- QR_PROMPTPAY --> StratQR[QRPaymentStrategy<br/>สร้าง PromptPay QR EMVCo Payload<br/>ลูกค้าสแกนจ่าย และระบบตรวจสลิป] --> PayResult
    DecisionMethod -- CREDIT_CARD --> StratCard[CardPaymentStrategy<br/>รูด/แตะบัตรผ่าน EDC Terminal<br/>Gateway ตัดเงินและส่งกลับ Approval Code] --> PayResult
    
    PayResult{ผลการทำธุรกรรม}
    PayResult -- สำเร็จ (SUCCESS) --> PaySuccess[ตั้ง Payment.paymentStatus = COMPLETED<br/>บันทึก paidAt = now และออกเลขที่ใบเสร็จ REC-xxx]
    PaySuccess --> SavePayRepo[บันทึก PaymentRepository.save]
    SavePayRepo --> LinkBooking[ผูก Payment เข้ากับ Booking.setPayment]
    LinkBooking --> ReturnReceipt[ส่งคืน PaymentResponseDTO พร้อมใบเสร็จ] --> endPaySuccess([ชำระเงินสำเร็จ])
    
    PayResult -- ล้มเหลว (FAILED) --> PayFailed[ตั้ง Payment.paymentStatus = FAILED<br/>บันทึก PaymentRepository.save]
    PayFailed --> ThrowEx[โยน PaymentProcessingException<br/>แจ้งลูกค้าเลือกช่องทางชำระเงินใหม่] --> endPayFail([ชำระเงินไม่สำเร็จ])
```

---

### 3.3 Booking Cancellation & Refund Flow (UC-10, UC-20)
* **ไฟล์รูปภาพ PNG:** [activity-diagram-cancellation.png](file:///C:/Users/Viphu/Desktop/University/PrinciplesOfSoftwareDesign/FIWDEE-CP353002-69_1PrinciplesOfSoftwareDesign/img/activity-diagram-cancellation.png)

![Cancellation & Refund Flow](../img/activity-diagram-cancellation.png)

```mermaid
flowchart TD
    startCancel([เริ่มต้นการยกเลิก]) --> C1[ลูกค้าร้องขอยกเลิกการจอง]
    C1 --> C2[พนักงานส่งคำขอ POST /api/bookings/id/cancel]
    C2 --> C3[ดึงข้อมูลการจอง BookingRepository.findById]
    C3 --> CheckState{ตรวจสอบสถานะปัจจุบันของ Booking}
    
    CheckState -- IN_SERVICE หรือ COMPLETED --> RejectCancel[ปฏิเสธการยกเลิก<br/>ไม่สามารถยกเลิกระหว่างหรือหลังให้บริการได้] --> endReject([สิ้นสุด])
    
    CheckState -- PENDING / CONFIRMED / CHECKED_IN --> CheckNotice{ระยะเวลายกเลิกล่วงหน้า<br/>เทียบกับ startDateTime}
    
    CheckNotice -- ล่วงหน้า >= 2 ชั่วโมง (BR-BKG-04) --> EligibleRefund[ได้รับสิทธิ์คืนเงินเต็มจำนวน]
    EligibleRefund --> DoCancel1[Booking.cancel -> สถานะเปลี่ยนเป็น CANCELLED<br/>BookingRepository.save]
    DoCancel1 --> CheckPaid{เคยมีการชำระเงินแล้วหรือไม่?}
    
    CheckPaid -- ชำระแล้ว (COMPLETED) --> ProcessRefund[PaymentService.processRefund<br/>สร้าง Refund Entity สถานะ COMPLETED<br/>ปรับ Payment เป็น REFUNDED<br/>Gateway คืนเงินเข้าบัญชีลูกค้า]
    CheckPaid -- ยังไม่ได้ชำระเงิน --> ReleaseRes
    ProcessRefund --> ReleaseRes
    
    CheckNotice -- ล่วงหน้าน้อยกว่า 2 ชั่วโมง --> LateCancel[ไม่ได้รับสิทธิ์คืนเงิน (Non-refundable)<br/>Booking.cancel -> สถานะเป็น CANCELLED<br/>BookingRepository.save]
    LateCancel --> ReleaseRes[คืนห้องนวดและตารางเวลาหมอนวดกลับสู่ระบบ]
    
    ReleaseRes --> PublishCancelEvent[Publish BookingStatusChangedEvent เป็น CANCELLED]
    PublishCancelEvent --> NotifyCancel[NotificationListener ส่งข้อความแจ้งเตือนลูกค้ายืนยันการยกเลิก]
    NotifyCancel --> endCancelSuccess([การยกเลิกเสร็จสมบูรณ์])
```

---

## 4. รายละเอียดกิจกรรมและการแบ่ง Swimlane (Activity Description)

| Swimlane | บทบาทและหน้าที่หลัก | รายการกิจกรรม (Activities) ที่รับผิดชอบ |
| :--- | :--- | :--- |
| **Customer** | ผู้รับบริการ / ลูกค้า | 1. เลือกบริการ แพ็กเกจ และระยะเวลานวด<br/>2. ระบุวัน เวลา หมอนวด และห้องที่ต้องการ<br/>3. เลือกช่องทางชำระเงินและส่งคำขอ<br/>4. เดินทางมาถึงร้านและแจ้งเช็คอินหน้าร้าน<br/>5. รับบัตรคิวและนั่งรอในโซนรับรอง<br/>6. เดินเข้าห้องนวดและรับบริการ<br/>7. ชำระเงินค่าบริการเต็มจำนวน (กรณีเลือกชำระหน้าร้าน / Walk-in) และรับใบเสร็จ |
| **Staff**<br/>*(Receptionist / Therapist)* | พนักงานต้อนรับและหมอนวด | 1. ค้นหาข้อมูลการจองและกด Check-in ลูกค้าหน้าร้าน<br/>2. ออกบัตรคิวและมอนิเตอร์กระดานคิวประจำวัน<br/>3. เรียกคิวถัดไปและพาลูกค้าเข้าห้องนวดที่จัดสรรไว้<br/>4. กดเริ่มให้บริการ (`startService`) เพื่อเริ่มนับเวลา<br/>5. ให้บริการนวดทางกายภาพตามมาตรฐาน<br/>6. กดจบบริการทางกายภาพ (`recordPhysicalCompletion`)<br/>7. รับเงินสด/รูดบัตร ณ เคาน์เตอร์และส่งมอบใบเสร็จ |
| **System**<br/>*(Backend Architecture)* | สถาปัตยกรรมระบบ FIWDEE | 1. ตรวจสอบ Resource Availability (Service, Therapist, Room, 15-min Buffer)<br/>2. ป้องกัน Concurrency Conflict / Double Booking ด้วย Atomic Transaction<br/>3. บังคับใช้วงจรชีวิตการจองตาม GoF State Pattern<br/>4. จัดการ Data Persistence ผ่าน Repository Interfaces<br/>5. จัดการ Event-Driven ผ่าน ApplicationEventPublisher และ Listeners<br/>6. ตรวจสอบ Invariant Rule: `Payment.paymentStatus == COMPLETED` ก่อนเปลี่ยน Booking เป็น `COMPLETED`<br/>7. ปรับสถานะห้องนวด (`AVAILABLE` $\rightarrow$ `OCCUPIED` $\rightarrow$ `CLEANING` $\rightarrow$ `AVAILABLE`) |
| **Payment Gateway**<br/>*(Bank / EDC / QR)* | ระบบประมวลผลธุรกรรมภายนอก | 1. ตรวจสอบความถูกต้องของสลิปโอนเงิน PromptPay QR (EMVCo)<br/>2. สื่อสารกับ EDC Terminal / ธนาคารเพื่อตัดวงเงินบัตรเครดิต<br/>3. ส่งกลับสถานะการทำธุรกรรม (Approval Code / Webhook Success) |

---

## 5. Booking State Lifecycle Alignment & Invariant Rules

### 5.1 ลำดับการเปลี่ยนสถานะการจอง (GoF State Pattern)

```text
[ Initial: PENDING ]
       │
       ▼ (Booking.confirm() -> PendingState.confirm())
[ CONFIRMED ]
       │
       ▼ (Booking.checkIn() -> ConfirmedState.checkIn())
[ CHECKED_IN ]
       │
       ▼ (Booking.startService() -> CheckedInState.startService())
[ IN_SERVICE ]
       │
       ├───────────────────────────────────────────────┐
       │ (recordPhysicalCompletion()                   │ (Payment must be COMPLETED)
       │  -> Room: CLEANING, Booking: IN_SERVICE)      ▼
       └──────────────────────────────────────> [ COMPLETED ]
                                                    │
                                                    ▼
                                          [ Terminal State ]
```

* **กฎการเปลี่ยนสถานะ:**
  1. $\text{PENDING} \rightarrow \text{CONFIRMED}$: เกิดขึ้นเมื่อสร้างการจองและยืนยันชำระเงิน/อนุมัติ
  2. $\text{CONFIRMED} \rightarrow \text{CHECKED_IN}$: เกิดขึ้นเมื่อลูกค้ามาถึงร้านและเช็คอินผ่านเคาน์เตอร์
  3. $\text{CHECKED_IN} \rightarrow \text{IN_SERVICE}$: เกิดขึ้นเมื่อหมอนวดเริ่มให้บริการในห้องนวด
  4. $\text{IN_SERVICE} \rightarrow \text{COMPLETED}$: เกิดขึ้น **หลังจากการนวดเสร็จสิ้นทางกายภาพและสถานะการชำระเงินเป็น `COMPLETED` แล้วเท่านั้น**
  5. **ห้ามข้าม State:** ห้ามเกิด $\text{PENDING} \rightarrow \text{COMPLETED}$ หรือ $\text{CHECKED_IN} \rightarrow \text{COMPLETED}$ โดยเด็ดขาด

### 5.2 Room Status & Cleaning Buffer (BR-RES-03)

```text
[ Room: AVAILABLE ]
       │
       ▼ (startService() -> RoomRepository.save(room))
[ Room: OCCUPIED ]
       │
       ▼ (recordPhysicalCompletion() -> RoomRepository.save(room))
[ Room: CLEANING ] (Turnover Buffer = 15 นาที ตาม cleaningBufferMinutes)
       │
       ▼ (Cleaning Timeout / Inspection Complete)
[ Room: AVAILABLE ]
```

---

## 6. Document Consistency Verification Audit

| มิติการตรวจสอบ (Audit Dimension) | ผลการตรวจ (Status) | รายละเอียดการประเมินความสอดคล้องกับ Source of Truth |
| :--- | :---: | :--- |
| **1. Domain Entity Coverage** | **`PASS`** | ใช้งานเฉพาะ 18 Domain Entities ที่ระบุใน `domain-model.md` (`Shop`, `User`, `Customer`, `Therapist`, `Room`, `Service`, `Booking`, `QueueItem`, `Payment`, `Refund`, ฯลฯ) |
| **2. Use Case Alignment** | **`PASS`** | สอดคล้องกับ Use Case ที่มี Activity Flow รองรับ ได้แก่ UC-07 (Booking), UC-08 (Availability), UC-10 (Cancel), UC-12 (Check-in), UC-13 (Queue), UC-14 (Update Status), UC-16 (Start Service), UC-17 (Complete Service), UC-19 (Payment) และ UC-20 (Refund) ส่วน UC-18 (Review Module) ระบุสถานะเป็น Architectural GAP ตามขอบเขตของระบบ |
| **3. Class Diagram Alignment** | **`PASS`** | เมธอดและคลาสทั้งหมดที่อ้างถึงมีอยู่จริงใน `class-diagram.md`: `RoomRepository.save()`, `Booking.confirm()`, `Booking.checkIn()`, `Booking.startService()`, `Booking.complete()`, `PaymentService.processPayment()` |
| **4. Sequence Diagram Alignment** | **`PASS`** | ลำดับและเงื่อนไขการทำงานตรงกับ `sequence-diagram.md` ทั้ง 3 Scenarios แบบ 1:1 |
| **5. State Pattern (LSP)** | **`PASS`** | รักษาลำดับสถานะ `PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `CHECKED_IN` $\rightarrow$ `IN_SERVICE` $\rightarrow$ `COMPLETED` โดยไม่มีการข้าม State |
| **6. Payment Settlement Rule** | **`PASS`** | บังคับใช้เงื่อนไข `Payment.paymentStatus == COMPLETED` ก่อนที่ Booking จะสามารถเปลี่ยนเป็น `COMPLETED` ได้ |
| **7. Queue / Observer Flow** | **`PASS`** | `QueueItem` ถูกสร้างขึ้นโดยอัตโนมัติเมื่อเกิด Event `CHECKED_IN` ผ่าน `QueueListener` สอดคล้องกับ Observer Pattern |
| **8. Room Repository Usage** | **`PASS`** | ปรับสถานะห้องผ่าน `RoomRepository.findById()` $\rightarrow$ `Room.setRoomStatus()` $\rightarrow$ `RoomRepository.save()` โดยไม่มีการใช้ `update()` เถื่อน |
| **9. Concurrency / Double Booking** | **`PASS`** | มีการระบุ Atomic Check / Concurrency Control ในขั้นตอนตรวจสอบและบันทึกการจอง |
| **10. Review Module (UC-18)** | **`GAP`** | ระบุขอบเขตของ Feedback/Review Module เป็น **Architectural GAP** อย่างชัดเจนตามเอกสารเดิม โดยไม่สร้างคลาสหรือเมธอดปลอม |
