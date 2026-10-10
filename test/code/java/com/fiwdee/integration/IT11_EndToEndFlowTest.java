package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentStatus;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * IT11 – เส้นทางทั้งระบบตาม sequence-diagram (Scenario-based)
 * แต่ละขั้นใช้ token ของ role ที่ทำขั้นนั้นจริง และตรวจผลในฐานข้อมูล
 */
@DisplayName("IT11 End-to-end flows – Scenario")
class IT11_EndToEndFlowTest extends IntegrationTestBase {

    private Account customer;

    @BeforeEach
    void customer() throws Exception {
        customer = registerCustomer();
    }

    // ------------------------------------------------------------ ขั้นตอนย่อยของ walk-in flow

    /** booking วันนี้ของ therapist1 ห้อง Room 1 ที่พนักงานยืนยันแล้ว */
    private Booking walkIn() {
        assumeNotNearMidnight();
        return booking(customer.id(), 1, "Room 1", "THAI", 60, soon(), BookingStatus.CONFIRMED);
    }

    /** check-in → call-next → therapist1 start • คืน queueId */
    private long checkInCallAndStart(Booking b) throws Exception {
        Res checkIn = PATCH("/api/bookings/" + b.getId() + "/check-in", receptionist(), null);
        assertThat(checkIn.status()).as("check-in " + checkIn).isEqualTo(200);
        long queueId = checkIn.id("$.data.queueId");

        Res called = POST("/api/admin/queue/call-next", receptionist(), null);
        assertThat(called.status()).as("call-next " + called).isEqualTo(200);
        assertThat(called.id("$.data.queueId")).isEqualTo(queueId);

        Res started = POST("/api/therapist/queue/" + queueId + "/start?therapistId=" + therapist(1).getId(),
                therapistToken(1), null);
        assertThat(started.status()).as("start " + started).isEqualTo(200);
        assertThat(bookingStatus(b.getId())).isEqualTo("IN_SERVICE");
        assertThat(roomStatus("Room 1")).isEqualTo("OCCUPIED");
        return queueId;
    }

    private Res therapistComplete(long queueId) throws Exception {
        return POST("/api/therapist/queue/" + queueId + "/complete?therapistId=" + therapist(1).getId(),
                therapistToken(1), null);
    }

    private Res payCash(Booking b) throws Exception {
        return POST("/api/bookings/" + b.getId() + "/payment", receptionist(), "{\"paymentMethod\":\"CASH\"}");
    }

    private String queueStatus(long queueId) {
        return jdbc.queryForObject("SELECT queue_status FROM queue_items WHERE id = ?", String.class, queueId);
    }

    // ------------------------------------------------------------ test cases

    @Test
    @DisplayName("IT11-TC001 (P1) Walk-in ครบเส้นทาง: check-in → เรียก → เริ่ม → จบ → ชำระ → รีวิว")
    void tc001() throws Exception {
        Booking b = walkIn();
        long queueId = checkInCallAndStart(b);

        assertThat(therapistComplete(queueId).status()).isEqualTo(200);
        assertThat(payCash(b).status()).isEqualTo(200);
        Res review = POST("/api/bookings/" + b.getId() + "/review", customer.token(),
                "{\"overallRating\":5,\"therapistRating\":5,\"cleanlinessRating\":5,\"comment\":\"ดีมาก\"}");
        assertThat(review.status()).as(review.toString()).isEqualTo(201);

        assertThat(bookingStatus(b.getId())).isEqualTo("COMPLETED");
        assertThat(queueStatus(queueId)).isEqualTo("COMPLETED");
        assertThat(roomStatus("Room 1")).isEqualTo("CLEANING");
        assertThat(jdbc.queryForObject("SELECT payment_status FROM payments WHERE booking_id = ?", String.class,
                b.getId())).isEqualTo(PaymentStatus.COMPLETED.name());
        assertThat(rows("SELECT COUNT(*) FROM reviews WHERE booking_id = ?", b.getId())).isEqualTo(1);
        assertThat(jdbc.queryForObject("SELECT average_rating FROM therapists WHERE id = ?", java.math.BigDecimal.class,
                therapist(1).getId())).isEqualByComparingTo("5.00");
    }

    @Test
    @DisplayName("IT11-TC002 (X1) หลังหมอนวดจบงานแต่ยังไม่ชำระ booking ต้องยัง IN_SERVICE [DEF-013]")
    void tc002() throws Exception {
        Booking b = walkIn();
        long queueId = checkInCallAndStart(b);

        assertThat(therapistComplete(queueId).status()).isEqualTo(200);

        assertThat(bookingStatus(b.getId())).as("Scenario 3 Phase B: รอชำระก่อนจึง COMPLETED").isEqualTo("IN_SERVICE");
    }

    @Test
    @DisplayName("IT11-TC003 (X2) ชำระก่อนหมอนวดกดจบ → คิว COMPLETED และห้อง CLEANING [DEF-014]")
    void tc003() throws Exception {
        Booking b = walkIn();
        long queueId = checkInCallAndStart(b);

        assertThat(payCash(b).status()).isEqualTo(200);

        assertThat(bookingStatus(b.getId())).isEqualTo("COMPLETED");
        assertThat(queueStatus(queueId)).as("คิวต้องถูกปิด (Scenario 3 Phase D)").isEqualTo("COMPLETED");
        assertThat(roomStatus("Room 1")).isEqualTo("CLEANING");
    }

    @Test
    @DisplayName("IT11-TC004 (P2) ลูกค้าออนไลน์: ดูรอบว่าง → จอง → ชำระ QR → ประวัติแสดง CONFIRMED")
    void tc004() throws Exception {
        Map<String, Object> before = slot(GET(availabilityUrl(D, "THAI", 60), null), "13:00");
        assertThat(before.get("available")).isEqualTo(true);
        long therapistId = idOfFirst(before, "availableTherapists");
        long roomId = idOfFirst(before, "availableRooms");

        Res booked = POST("/api/bookings", customer.token(), """
                {"serviceId":%d,"durationOptionId":%d,"therapistId":%d,"roomId":%d,"startDateTime":"%s"}
                """.formatted(service("THAI").getId(), option("THAI", 60).getId(), therapistId, roomId, D.atTime(13, 0)));
        assertThat(booked.status()).as(booked.toString()).isEqualTo(201);
        assertThat(booked.str("$.data.status")).isEqualTo("PENDING");
        long bookingId = booked.id("$.data.id");

        Res paid = POST("/api/bookings/" + bookingId + "/payment", customer.token(), "{\"paymentMethod\":\"QR_PROMPTPAY\"}");
        assertThat(paid.status()).as(paid.toString()).isEqualTo(200);

        Res my = GET("/api/bookings/my", customer.token());
        assertThat(my.list("$.data")).singleElement().satisfies(m -> assertThat(m.get("status")).isEqualTo("CONFIRMED"));
        Map<String, Object> after = slot(GET(availabilityUrl(D, "THAI", 60), null), "13:00");
        assertThat(count(after, "availableRooms")).isEqualTo(count(before, "availableRooms") - 1);
    }

    @Test
    @DisplayName("IT11-TC005 (P3) ยกเลิกแล้วรอบเวลากลับมาว่าง")
    void tc005() throws Exception {
        Account second = registerCustomer();
        Res first = POST("/api/bookings", customer.token(), bookingJson(null, "THAI", 60, 1, "Room 1", D.atTime(14, 0)));
        Res other = POST("/api/bookings", second.token(), bookingJson(null, "THAI", 60, 2, "Room 2", D.atTime(14, 0)));
        assertThat(first.status()).isEqualTo(201);
        assertThat(other.status()).isEqualTo(201);
        assertThat(slot(GET(availabilityUrl(D, "THAI", 60), null), "14:00").get("available")).isEqualTo(false);

        Res cancelled = PATCH("/api/bookings/" + first.id("$.data.id") + "/cancel", customer.token(), null);
        assertThat(cancelled.status()).isEqualTo(200);

        assertThat(slot(GET(availabilityUrl(D, "THAI", 60), null), "14:00").get("available")).isEqualTo(true);
    }

    @Test
    @DisplayName("IT11-TC006 (X3) ลูกค้าคนอื่นรีวิว booking ไม่ได้ → 403 [DEF-010]")
    void tc006() throws Exception {
        Booking b = booking(customer.id(), 1, "Room 1", "THAI", 60, LocalDateTime.now().minusDays(1),
                BookingStatus.COMPLETED);
        payment(b, "500.00", PaymentStatus.COMPLETED, LocalDateTime.now().minusDays(1));

        Res res = POST("/api/bookings/" + b.getId() + "/review", registerCustomer().token(),
                "{\"overallRating\":1,\"therapistRating\":1,\"cleanlinessRating\":1}");

        assertThat(res.status()).as(res.toString()).isEqualTo(403);
    }

    @Test
    @DisplayName("IT11-TC007 (X4) 8 request จองช่วงเดียวกันพร้อมกัน (ทำ 3 รอบ) → สำเร็จได้รอบละ 1 เท่านั้น [DEF-017]")
    void tc007() throws Exception {
        // race condition เกิดหรือไม่ขึ้นกับจังหวะ จึงยิง 3 รอบ (3 ช่วงเวลา) เพื่อเพิ่มโอกาสเจอ
        List<String> report = new ArrayList<>();
        boolean allRoundsSafe = true;
        for (int hour : new int[] {14, 15, 16}) {
            LocalDateTime slotStart = D.atTime(hour, 0);
            int created = burst(8, bookingJson(null, "THAI", 60, 1, "Room 1", slotStart));
            int inDb = rows("SELECT COUNT(*) FROM bookings WHERE therapist_id = ? AND start_date_time = ?",
                    therapist(1).getId(), slotStart);
            report.add(hour + ":00 → 201 จำนวน " + created + ", ในฐานข้อมูล " + inDb + " แถว");
            allRoundsSafe &= created == 1 && inDb == 1;
        }
        assertThat(allRoundsSafe).as("ทุกรอบต้องจองสำเร็จได้ 1 รายการเท่านั้น: " + report).isTrue();
    }

    /** ยิง POST /api/bookings พร้อมกัน n request แล้วคืนจำนวนที่ได้ 201 */
    private int burst(int n, String body) throws Exception {
        String token = customer.token();
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(n);
        try {
            List<Future<Integer>> results = new ArrayList<>();
            for (int i = 0; i < n; i++) {
                Callable<Integer> job = () -> {
                    start.await();
                    return POST("/api/bookings", token, body).status();
                };
                results.add(pool.submit(job));
            }
            start.countDown();
            int created = 0;
            for (Future<Integer> f : results) {
                if (f.get(60, TimeUnit.SECONDS) == 201) {
                    created++;
                }
            }
            return created;
        } finally {
            pool.shutdownNow();
            // รอให้ทุก thread จบก่อน @AfterEach ล้างตาราง (TRUNCATE ต้องการ lock ทั้งตาราง)
            pool.awaitTermination(30, TimeUnit.SECONDS);
        }
    }

    @Test
    @DisplayName("IT11-TC008 (X5) รีวิว booking ที่ยังไม่ใช้บริการ → 400")
    void tc008() throws Exception {
        Booking b = booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = POST("/api/bookings/" + b.getId() + "/review", customer.token(),
                "{\"overallRating\":5,\"therapistRating\":5,\"cleanlinessRating\":5}");

        assertThat(res.status()).isEqualTo(400);
        assertThat(res.str("$.message")).contains("only be submitted for a completed booking");
    }

    @SuppressWarnings("unchecked")
    private static long idOfFirst(Map<String, Object> slot, String key) {
        Map<String, Object> first = ((List<Map<String, Object>>) slot.get(key)).get(0);
        return ((Number) first.get("id")).longValue();
    }
}
