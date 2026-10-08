# TEST_ACCOUNTS.md — บัญชีทดสอบของระบบ FIWDEE

> บัญชีเหล่านี้ถูกสร้างอัตโนมัติตอนรัน backend โดย
> `config/DemoDataSeeder.java` (ลูกค้า + ข้อมูลร้าน + การจองตัวอย่าง) และ
> `config/AdminAccountInitializer.java` (แอดมิน) — ทุกตัว idempotent (เช็คว่ามีอยู่แล้วจะไม่สร้างซ้ำ)
> ปิด seeding ได้ด้วย property `fiwdee.seed-demo-data=false` / `fiwdee.seed-admin-accounts=false`

## บัญชีทดสอบ

| บทบาท | ตัวตน (identifier) | รหัสผ่าน | หมายเหตุ |
|---|---|---|---|
| ลูกค้า (CUSTOMER) | `customer@test.com` หรือ `081-000-3333` | `customer1234` | มีโปรไฟล์ครบ + ประวัติการจอง 4 รายการ (ยืนยันแล้ว / รอยืนยัน / เสร็จสิ้น / ยกเลิก) — ใช้เดโมหน้าโปรไฟล์ `#profile` และประวัติการจอง `#my-bookings` |
| ผู้จัดการ (OWNER) | `owner@fiwdee-massage.co.th` | `admin1234` | เข้าระบบหลังบ้าน `#admin` ได้ทุกหน้า (รวม `#admin/users`) |
| พนักงานต้อนรับ (RECEPTIONIST) | `reception@fiwdee-massage.co.th` | `recep1234` | เข้า `#admin` ได้ (ยกเว้นหน้า Users summary) |
| หมอนวด (THERAPIST) 1–6 | `therapist1@fiwdee-massage.co.th` … `therapist6@fiwdee-massage.co.th` | `therapist1234` | มี 6 คน: มาลี, ปรีชา, สมศรี, จันทร์, บุญมี, วิไล |

## วิธีเข้าสู่ระบบ

- ช่อง identifier รับได้ทั้ง **email / username / เบอร์โทร** ตัวใดตัวหนึ่ง
- ลูกค้า: ปุ่ม "เข้าสู่ระบบ" มุมขวาบนของหน้าเว็บ
- แอดมิน: ไปที่ `#admin`
- สมัครสมาชิกใหม่ได้ที่ `#register` (สร้างบัญชี CUSTOMER + login อัตโนมัติ)

## ข้อมูลตัวอย่างที่ seed พร้อมระบบ

- ร้าน FIWDEE Massage + ห้อง 6 ห้อง (101–103 เดี่ยว, 201–202 คู่, 301 VIP)
- บริการ 2 รายการ: นวดไทยแผนโบราณ (60/90/120 นาที), นวดอโรม่าบำบัด (90/120 นาที)
- การจองตัวอย่างของ customer@test.com รหัส `FIW-SEED-0001`–`0004` (สถานะต่างกัน, เรียงวันที่อดีต–อนาคต)
- การจอง `FIW-SEED-0001` (เสร็จสิ้น) มี Payment record (QR PromptPay, ชำระแล้ว)
