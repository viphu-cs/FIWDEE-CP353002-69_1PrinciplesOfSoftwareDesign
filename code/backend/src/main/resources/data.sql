-- ===================================================================
-- FIWDEE — Massage Management & Booking System
-- Database Seed Data DML (PostgreSQL 14+)
-- Seed Initial Shop Profile, Rooms, Services, Staff, and Demo Data
-- Course: CP353002 Principles of Software Design
-- ===================================================================

-- -------------------------------------------------------------------
-- 1. users: Initial User Accounts
-- Password BCrypt Hashes:
--   admin1234      -> $2a$10$Lwzcm1S3BUyk2WBgyZZWdOh7JoRcWgL0LBVXIZSeItxeTjxwfGzQ2
--   recep1234      -> $2a$10$eOlHNzf29ZUDgp77pUKCm.mCFzys1fQnK.LXcGbJj4oLL4zXUzEAG
--   customer1234   -> $2a$10$blABMtDK.vjioD3WwNZIqugJX/YUY..Xgl3IcrVcyXiuExCsVpAgO
--   therapist1234  -> $2a$10$fSloZHvrWPZ9S2Guer39x.tvwHUAvGewWfK8jOPtw6335T.nlDPMG
-- -------------------------------------------------------------------
INSERT INTO users (id, username, password_hash, full_name, email, phone_number, role, is_active, created_at)
VALUES
    (1, 'owner@fiwdee-massage.co.th', '$2a$10$Lwzcm1S3BUyk2WBgyZZWdOh7JoRcWgL0LBVXIZSeItxeTjxwfGzQ2', 'สมชาย สุขสบาย', 'owner@fiwdee-massage.co.th', '081-000-1111', 'OWNER', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00'),
    (2, 'reception@fiwdee-massage.co.th', '$2a$10$eOlHNzf29ZUDgp77pUKCm.mCFzys1fQnK.LXcGbJj4oLL4zXUzEAG', 'วิภาวรรณ ต้อนรับ', 'reception@fiwdee-massage.co.th', '081-000-2222', 'RECEPTIONIST', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00'),
    (3, 'customer@test.com', '$2a$10$blABMtDK.vjioD3WwNZIqugJX/YUY..Xgl3IcrVcyXiuExCsVpAgO', 'สมหญิง รักสุขภาพ', 'customer@test.com', '081-000-3333', 'CUSTOMER', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00'),
    (4, 'therapist1@fiwdee-massage.co.th', '$2a$10$fSloZHvrWPZ9S2Guer39x.tvwHUAvGewWfK8jOPtw6335T.nlDPMG', 'มาลี มือนวด', 'therapist1@fiwdee-massage.co.th', '081-000-4444', 'THERAPIST', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00'),
    (5, 'therapist2@fiwdee-massage.co.th', '$2a$10$fSloZHvrWPZ9S2Guer39x.tvwHUAvGewWfK8jOPtw6335T.nlDPMG', 'ปรีชา ปลดปล่อย', 'therapist2@fiwdee-massage.co.th', '081-000-5555', 'THERAPIST', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00'),
    (6, 'therapist3@fiwdee-massage.co.th', '$2a$10$fSloZHvrWPZ9S2Guer39x.tvwHUAvGewWfK8jOPtw6335T.nlDPMG', 'สมศรี สมดุล', 'therapist3@fiwdee-massage.co.th', '081-000-6666', 'THERAPIST', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00'),
    (7, 'therapist4@fiwdee-massage.co.th', '$2a$10$fSloZHvrWPZ9S2Guer39x.tvwHUAvGewWfK8jOPtw6335T.nlDPMG', 'จันทร์ เจ้าเวทย์', 'therapist4@fiwdee-massage.co.th', '081-000-7777', 'THERAPIST', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00'),
    (8, 'therapist5@fiwdee-massage.co.th', '$2a$10$fSloZHvrWPZ9S2Guer39x.tvwHUAvGewWfK8jOPtw6335T.nlDPMG', 'บุญมี บำบัด', 'therapist5@fiwdee-massage.co.th', '081-000-8888', 'THERAPIST', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00'),
    (9, 'therapist6@fiwdee-massage.co.th', '$2a$10$fSloZHvrWPZ9S2Guer39x.tvwHUAvGewWfK8jOPtw6335T.nlDPMG', 'วิไล วิเวก', 'therapist6@fiwdee-massage.co.th', '081-000-9999', 'THERAPIST', TRUE, (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 2. owners: Subtype Specialization for Store Executive
-- -------------------------------------------------------------------
INSERT INTO owners (id, management_level)
VALUES (1, 'EXECUTIVE')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 3. receptionists: Subtype Specialization for Front-Desk
-- -------------------------------------------------------------------
INSERT INTO receptionists (id, staff_code, counter_station)
VALUES (2, 'RCPT-001', 'Counter Station 1')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 4. customers: Subtype Specialization for Customer Profile
-- -------------------------------------------------------------------
INSERT INTO customers (id, health_notes, preferred_pressure, registered_date)
VALUES (3, 'ปวดบ่าและต้นคอเรื้อรัง หลีกเลี่ยงการกดแรงบริเวณกระดูกสันหลังส่วนเอว', 'MEDIUM', (CURRENT_DATE - INTERVAL '30 days') + TIME '09:00:00')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 5. therapists: 6 Massage Therapists (Dynamic Resource Requirement)
-- -------------------------------------------------------------------
INSERT INTO therapists (id, nickname, bio, commission_rate, employment_status, average_rating, photo_url)
VALUES
    (4, 'มาลี', 'ผู้เชี่ยวชาญการนวดไทยแผนโบราณและอโรม่า ประสบการณ์ 8 ปี มือหนักปานกลาง-หนัก', 30.00, 'ACTIVE', 4.90, '/images/booking/therapist-mali.jpg'),
    (5, 'ปรีชา', 'ชำนาญการนวดคลายเส้น กดจุดสมาธิ และแก้อาการออฟฟิศซินโดรม ประสบการณ์ 10 ปี', 30.00, 'ACTIVE', 4.85, '/images/booking/therapist-mali.jpg'),
    (6, 'สมศรี', 'เชี่ยวชาญการนวดอโรม่าเธอราปีและนวดหินร้อน ฟื้นฟูสมดุลร่างกาย ประสบการณ์ 6 ปี', 30.00, 'ACTIVE', 4.95, '/images/booking/therapist-bua.jpg'),
    (7, 'จันทร์', 'เชี่ยวชาญการนวดไทยประยุกต์และนวดกดจุดสะท้อนฝ่าเท้า ประสบการณ์ 5 ปี', 30.00, 'ACTIVE', 4.80, '/images/booking/therapist-praew.jpg'),
    (8, 'บุญมี', 'นวดคลายกล้ามเนื้อระดับลึก Deep Tissue ปลดล็อกกล้ามเนื้อตึงสะสม ประสบการณ์ 7 ปี', 30.00, 'ACTIVE', 4.75, '/images/booking/therapist-karn.jpg'),
    (9, 'วิไล', 'ผู้เชี่ยวชาญการนวดน้ำมันอุ่นและสปาผ่อนคลายระดับพรีเมียม ประสบการณ์ 9 ปี', 30.00, 'ACTIVE', 4.90, '/images/booking/therapist-bua.jpg')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 6. shops: Shop Information
-- -------------------------------------------------------------------
INSERT INTO shops (id, shop_name, address, phone_number, description, is_active)
VALUES (1, 'FIWDEE Massage', '123 ถนนมิตรภาพ ตำบลในเมือง อำเภอเมือง ขอนแก่น 40000', '043-000-0000', 'สถานพักผ่อนและนวดบำบัดใจกลางเมืองขอนแก่น บริการนวดไทย อโรม่า และสปาเพื่อสุขภาพ', TRUE)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 7. business_hours: 7 Days Opening Schedule (10:00 - 22:00)
-- -------------------------------------------------------------------
INSERT INTO business_hours (id, shop_id, day_of_week, open_time, close_time, is_closed)
VALUES
    (1, 1, 'MONDAY', '10:00:00', '22:00:00', FALSE),
    (2, 1, 'TUESDAY', '10:00:00', '22:00:00', FALSE),
    (3, 1, 'WEDNESDAY', '10:00:00', '22:00:00', FALSE),
    (4, 1, 'THURSDAY', '10:00:00', '22:00:00', FALSE),
    (5, 1, 'FRIDAY', '10:00:00', '22:00:00', FALSE),
    (6, 1, 'SATURDAY', '10:00:00', '22:00:00', FALSE),
    (7, 1, 'SUNDAY', '10:00:00', '22:00:00', FALSE)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 8. rooms: 6 Massage Rooms (Dynamic Resource Requirement)
-- -------------------------------------------------------------------
INSERT INTO rooms (id, room_number, room_type, capacity, room_status, cleaning_buffer_minutes, is_active)
VALUES
    (1, '101', 'SINGLE', 1, 'AVAILABLE', 15, TRUE),
    (2, '102', 'SINGLE', 1, 'AVAILABLE', 15, TRUE),
    (3, '103', 'SINGLE', 1, 'AVAILABLE', 15, TRUE),
    (4, '201', 'COUPLE', 2, 'AVAILABLE', 15, TRUE),
    (5, '202', 'COUPLE', 2, 'AVAILABLE', 15, TRUE),
    (6, '301', 'VIP', 2, 'AVAILABLE', 20, TRUE)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 9. services: Treatment Catalog
-- -------------------------------------------------------------------
INSERT INTO services (id, service_code, service_name, description, category, required_room_type, is_active)
VALUES
    (1, 'SVC-THAI_MASSAGE', 'นวดไทยแผนโบราณ', 'นวดกดจุดผ่อนคลายกล้ามเนื้อตามแนวเส้นประธานสิบ คลายความเมื่อยล้าและกระตุ้นการไหลเวียนเลือด', 'THAI_MASSAGE', 'SINGLE', TRUE),
    (2, 'SVC-AROMA', 'นวดอโรม่าบำบัด', 'นวดบำบัดด้วยน้ำมันหอมระเหยธรรมชาติ สัมผัสความนุ่มนวลและผ่อนคลายความเครียดลึกถึงจิตใจ', 'AROMA', 'SINGLE', TRUE),
    (3, 'SVC-FOOT', 'นวดเท้าและกดจุดสะท้อน', 'นวดกระตุ้นจุดสะท้อนฝ่าเท้า บรรเทาอาการเมื่อยล้าจากการยืนหรือเดิน พร้อมฟื้นฟูระบบการทำงานของอวัยวะ', 'FOOT_MASSAGE', 'SINGLE', TRUE),
    (4, 'SVC-WARM_OIL', 'นวดน้ำมันร้อนคลายกล้ามเนื้อ', 'นวดบำบัดด้วยน้ำมันอุ่นสูตรพิเศษ บรรเทาอาการกล้ามเนื้อตึงลึกในห้องส่วนตัว VIP', 'WARM_OIL', 'VIP', TRUE)
ON CONFLICT (id) DO UPDATE SET
    service_code = EXCLUDED.service_code,
    service_name = EXCLUDED.service_name,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    required_room_type = EXCLUDED.required_room_type,
    is_active = EXCLUDED.is_active;

-- -------------------------------------------------------------------
-- 10. service_duration_options: Duration Tiers and Pricing
-- -------------------------------------------------------------------
INSERT INTO service_duration_options (id, service_id, duration_minutes, price, is_active)
VALUES
    (1, 1, 60, 500.00, TRUE),
    (2, 1, 90, 700.00, TRUE),
    (3, 1, 120, 900.00, TRUE),
    (4, 2, 60, 700.00, TRUE),
    (5, 2, 90, 950.00, TRUE),
    (6, 2, 120, 1200.00, TRUE),
    (7, 3, 60, 400.00, TRUE),
    (8, 3, 90, 550.00, TRUE),
    (9, 3, 120, 700.00, TRUE),
    (10, 4, 60, 800.00, TRUE),
    (11, 4, 90, 1100.00, TRUE),
    (12, 4, 120, 1400.00, TRUE)
ON CONFLICT (id) DO UPDATE SET
    service_id = EXCLUDED.service_id,
    duration_minutes = EXCLUDED.duration_minutes,
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active;

-- -------------------------------------------------------------------
-- 11. therapist_skills: Many-to-Many Skill Matrix & Qualifications
-- -------------------------------------------------------------------
INSERT INTO therapist_skills (id, therapist_id, service_id, skill_level, is_certified, certified_date)
VALUES
    (1, 4, 1, 'EXPERT', TRUE, '2020-03-15'),
    (2, 4, 2, 'ADVANCED', TRUE, '2021-06-20'),
    (3, 5, 1, 'EXPERT', TRUE, '2019-11-10'),
    (4, 5, 3, 'ADVANCED', TRUE, '2022-01-18'),
    (5, 6, 2, 'EXPERT', TRUE, '2018-05-12'),
    (6, 6, 4, 'EXPERT', TRUE, '2020-08-25'),
    (7, 7, 1, 'ADVANCED', TRUE, '2021-02-14'),
    (8, 7, 3, 'EXPERT', TRUE, '2020-09-30'),
    (9, 8, 1, 'EXPERT', TRUE, '2019-04-10'),
    (10, 8, 4, 'ADVANCED', TRUE, '2022-07-05'),
    (11, 9, 2, 'EXPERT', TRUE, '2020-10-15'),
    (12, 9, 4, 'EXPERT', TRUE, '2021-12-01')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 12. therapist_schedules: Daily Duty Schedules
-- -------------------------------------------------------------------
INSERT INTO therapist_schedules (id, therapist_id, schedule_date, is_day_off, leave_reason, notes)
VALUES
    (1, 4, CURRENT_DATE, FALSE, NULL, 'กะเช้าพร้อมให้บริการ'),
    (2, 5, CURRENT_DATE, FALSE, NULL, 'กะเช้าพร้อมให้บริการ'),
    (3, 6, CURRENT_DATE, FALSE, NULL, 'กะบ่ายพร้อมให้บริการ'),
    (4, 7, CURRENT_DATE, FALSE, NULL, 'กะเช้าพร้อมให้บริการ'),
    (5, 8, CURRENT_DATE, FALSE, NULL, 'กะบ่ายพร้อมให้บริการ'),
    (6, 9, CURRENT_DATE, FALSE, NULL, 'กะบ่ายพร้อมให้บริการ')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 13. work_shifts: Work Shifts per Schedule
-- -------------------------------------------------------------------
INSERT INTO work_shifts (id, schedule_id, shift_name, start_time, end_time, shift_status)
VALUES
    (1, 1, 'Morning Shift', '10:00:00', '19:00:00', 'ACTIVE'),
    (2, 2, 'Morning Shift', '10:00:00', '19:00:00', 'ACTIVE'),
    (3, 3, 'Afternoon Shift', '13:00:00', '22:00:00', 'ACTIVE'),
    (4, 4, 'Morning Shift', '10:00:00', '19:00:00', 'ACTIVE'),
    (5, 5, 'Afternoon Shift', '13:00:00', '22:00:00', 'ACTIVE'),
    (6, 6, 'Afternoon Shift', '13:00:00', '22:00:00', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------------------
-- 14. bookings: Sample Bookings Across Key Lifecycle States
-- -------------------------------------------------------------------
INSERT INTO bookings (
    id, booking_reference_code, customer_id, therapist_id, room_id, service_id,
    duration_option_id, receptionist_id, start_date_time, end_date_time,
    total_price, status, booking_channel, special_notes,
    actual_start_time, actual_end_time, version, created_at, updated_at
)
VALUES
    (
        1, 'BK-' || TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'YYYYMMDD') || '-7A1B2C', 3, 4, 1, 1,
        1, 2,
        (CURRENT_DATE - INTERVAL '7 days') + TIME '14:00:00',
        (CURRENT_DATE - INTERVAL '7 days') + TIME '15:00:00',
        500.00, 'COMPLETED', 'ONLINE', 'ข้อมูลตัวอย่างการจองที่เสร็จสิ้นสมบูรณ์',
        (CURRENT_DATE - INTERVAL '7 days') + TIME '14:00:00',
        (CURRENT_DATE - INTERVAL '7 days') + TIME '15:00:00',
        0,
        (CURRENT_DATE - INTERVAL '8 days') + TIME '10:30:00',
        (CURRENT_DATE - INTERVAL '7 days') + TIME '15:00:00'
    ),
    (
        2, 'BK-' || TO_CHAR(CURRENT_DATE - INTERVAL '3 days', 'YYYYMMDD') || '-8D4E5F', 3, 5, 1, 1,
        1, NULL,
        (CURRENT_DATE - INTERVAL '3 days') + TIME '10:00:00',
        (CURRENT_DATE - INTERVAL '3 days') + TIME '11:00:00',
        500.00, 'CANCELLED', 'ONLINE', 'ลูกค้ายกเลิกเนื่องจากติดธุระด่วน',
        NULL, NULL,
        0,
        (CURRENT_DATE - INTERVAL '4 days') + TIME '09:15:00',
        (CURRENT_DATE - INTERVAL '3 days') + TIME '08:00:00'
    ),
    (
        3, 'BK-' || TO_CHAR(CURRENT_DATE + INTERVAL '1 day', 'YYYYMMDD') || '-9C3E1A', 3, 4, 1, 1,
        2, 2,
        (CURRENT_DATE + INTERVAL '1 day') + TIME '16:00:00',
        (CURRENT_DATE + INTERVAL '1 day') + TIME '17:30:00',
        700.00, 'CONFIRMED', 'ONLINE', 'ยืนยันการจองเรียบร้อย รอลูกค้าเดินทางมาถึง',
        NULL, NULL,
        0,
        CURRENT_DATE + TIME '10:00:00',
        CURRENT_DATE + TIME '10:00:00'
    ),
    (
        4, 'BK-' || TO_CHAR(CURRENT_DATE + INTERVAL '3 days', 'YYYYMMDD') || '-2F8D4B', 3, 6, 2, 2,
        5, NULL,
        (CURRENT_DATE + INTERVAL '3 days') + TIME '11:00:00',
        (CURRENT_DATE + INTERVAL '3 days') + TIME '12:30:00',
        950.00, 'PENDING', 'ONLINE', 'รอการยืนยันคิวจากแผนกต้อนรับ',
        NULL, NULL,
        0,
        CURRENT_DATE + TIME '11:00:00',
        CURRENT_DATE + TIME '11:00:00'
    )
ON CONFLICT (id) DO UPDATE SET
    booking_reference_code = EXCLUDED.booking_reference_code,
    customer_id = EXCLUDED.customer_id,
    therapist_id = EXCLUDED.therapist_id,
    room_id = EXCLUDED.room_id,
    service_id = EXCLUDED.service_id,
    duration_option_id = EXCLUDED.duration_option_id,
    receptionist_id = EXCLUDED.receptionist_id,
    start_date_time = EXCLUDED.start_date_time,
    end_date_time = EXCLUDED.end_date_time,
    total_price = EXCLUDED.total_price,
    status = EXCLUDED.status,
    booking_channel = EXCLUDED.booking_channel,
    special_notes = EXCLUDED.special_notes,
    actual_start_time = EXCLUDED.actual_start_time,
    actual_end_time = EXCLUDED.actual_end_time,
    version = EXCLUDED.version,
    created_at = EXCLUDED.created_at,
    updated_at = EXCLUDED.updated_at;

-- -------------------------------------------------------------------
-- 15. queue_items: Sample Queue Ticket for Check-in
-- -------------------------------------------------------------------
INSERT INTO queue_items (id, booking_id, queue_number, queue_date, check_in_time, called_time, queue_status, priority_level)
VALUES (
    1, 1, 'Q-001', CURRENT_DATE - INTERVAL '7 days',
    (CURRENT_DATE - INTERVAL '7 days') + TIME '13:50:00',
    (CURRENT_DATE - INTERVAL '7 days') + TIME '13:58:00',
    'COMPLETED', 0
)
ON CONFLICT (id) DO UPDATE SET
    booking_id = EXCLUDED.booking_id,
    queue_number = EXCLUDED.queue_number,
    queue_date = EXCLUDED.queue_date,
    check_in_time = EXCLUDED.check_in_time,
    called_time = EXCLUDED.called_time,
    queue_status = EXCLUDED.queue_status,
    priority_level = EXCLUDED.priority_level;

-- -------------------------------------------------------------------
-- 16. payments: Immutable Audit Financial Record for Completed Booking
-- -------------------------------------------------------------------
INSERT INTO payments (
    id, booking_id, receptionist_id, payment_reference_code, receipt_number,
    gross_amount, discount_amount, net_amount, payment_method, payment_status,
    paid_at, transaction_note
)
VALUES (
    1, 1, 2,
    'PAY-' || TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'YYYYMMDD') || '-7A1B2C',
    'REC-' || TO_CHAR(CURRENT_DATE - INTERVAL '7 days', 'YYYYMMDD') || '-7A1B2C',
    500.00, 0.00, 500.00, 'QR_PROMPTPAY', 'COMPLETED',
    (CURRENT_DATE - INTERVAL '7 days') + TIME '15:00:00',
    'ชำระผ่าน PromptPay QR เรียบร้อย ตรวจสอบยอดเงินแล้ว'
)
ON CONFLICT (id) DO UPDATE SET
    booking_id = EXCLUDED.booking_id,
    receptionist_id = EXCLUDED.receptionist_id,
    payment_reference_code = EXCLUDED.payment_reference_code,
    receipt_number = EXCLUDED.receipt_number,
    gross_amount = EXCLUDED.gross_amount,
    discount_amount = EXCLUDED.discount_amount,
    net_amount = EXCLUDED.net_amount,
    payment_method = EXCLUDED.payment_method,
    payment_status = EXCLUDED.payment_status,
    paid_at = EXCLUDED.paid_at,
    transaction_note = EXCLUDED.transaction_note;

-- -------------------------------------------------------------------
-- 17. reviews: Sample Customer Review for Completed Booking
-- -------------------------------------------------------------------
INSERT INTO reviews (id, booking_id, overall_rating, therapist_rating, cleanliness_rating, comment, submitted_at)
VALUES (
    1, 1, 5, 5, 5,
    'หมอนวดมาลีบริการดีมาก นวดตรงจุด น้ำหนักมือกำลังดี บรรยากาศห้องสะอาดและผ่อนคลาย ประทับใจมากค่ะ',
    (CURRENT_DATE - INTERVAL '7 days') + TIME '15:15:00'
)
ON CONFLICT (id) DO UPDATE SET
    booking_id = EXCLUDED.booking_id,
    overall_rating = EXCLUDED.overall_rating,
    therapist_rating = EXCLUDED.therapist_rating,
    cleanliness_rating = EXCLUDED.cleanliness_rating,
    comment = EXCLUDED.comment,
    submitted_at = EXCLUDED.submitted_at;

-- -------------------------------------------------------------------
-- Synchronize PostgreSQL Identity Sequences with Max Inserted IDs
-- -------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('users', 'id'), COALESCE(MAX(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('shops', 'id'), COALESCE(MAX(id), 1)) FROM shops;
SELECT setval(pg_get_serial_sequence('business_hours', 'id'), COALESCE(MAX(id), 1)) FROM business_hours;
SELECT setval(pg_get_serial_sequence('rooms', 'id'), COALESCE(MAX(id), 1)) FROM rooms;
SELECT setval(pg_get_serial_sequence('services', 'id'), COALESCE(MAX(id), 1)) FROM services;
SELECT setval(pg_get_serial_sequence('service_duration_options', 'id'), COALESCE(MAX(id), 1)) FROM service_duration_options;
SELECT setval(pg_get_serial_sequence('therapist_skills', 'id'), COALESCE(MAX(id), 1)) FROM therapist_skills;
SELECT setval(pg_get_serial_sequence('therapist_schedules', 'id'), COALESCE(MAX(id), 1)) FROM therapist_schedules;
SELECT setval(pg_get_serial_sequence('work_shifts', 'id'), COALESCE(MAX(id), 1)) FROM work_shifts;
SELECT setval(pg_get_serial_sequence('bookings', 'id'), COALESCE(MAX(id), 1)) FROM bookings;
SELECT setval(pg_get_serial_sequence('queue_items', 'id'), COALESCE(MAX(id), 1)) FROM queue_items;
SELECT setval(pg_get_serial_sequence('payments', 'id'), COALESCE(MAX(id), 1)) FROM payments;
SELECT setval(pg_get_serial_sequence('refunds', 'id'), COALESCE(MAX(id), 1)) FROM refunds;
SELECT setval(pg_get_serial_sequence('reviews', 'id'), COALESCE(MAX(id), 1)) FROM reviews;
