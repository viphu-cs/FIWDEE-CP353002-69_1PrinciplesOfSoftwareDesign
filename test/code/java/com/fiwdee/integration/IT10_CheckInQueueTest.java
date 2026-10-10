package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * IT10 – check-in → BookingStatusChangedEvent → QueueListener (Observer) → queue_items (Weak Robust EC)
 * booking วันนี้เริ่มในอีก 5 นาที สร้างด้วย repository • ใช้ spy ตรวจว่า listener ได้รับ event จริง
 */
@DisplayName("IT10 Check-in, queue & observer – EC")
class IT10_CheckInQueueTest extends IntegrationTestBase {

    private Account customer;
    private Booking a;

    @BeforeEach
    void data() throws Exception {
        assumeNotNearMidnight();
        customer = registerCustomer();
        a = booking(customer.id(), 1, "Room 1", "THAI", 60, soon(), BookingStatus.CONFIRMED);
    }

    private Res checkIn(long bookingId) throws Exception {
        return PATCH("/api/bookings/" + bookingId + "/check-in", receptionist(), null);
    }

    private int queueRows(long bookingId) {
        return rows("SELECT COUNT(*) FROM queue_items WHERE booking_id = ?", bookingId);
    }

    @Test
    @DisplayName("IT10-TC001 (V1) check-in → Q001 WAITING, booking CHECKED_IN, QueueListener ได้รับ event 1 ครั้ง")
    void tc001() throws Exception {
        Res res = checkIn(a.getId());

        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        assertThat(res.str("$.data.queueNumber")).isEqualTo("Q001");
        assertThat(res.str("$.data.queueStatus")).isEqualTo("WAITING");
        assertThat(bookingStatus(a.getId())).isEqualTo("CHECKED_IN");
        assertThat(queueRows(a.getId())).isEqualTo(1);
        verify(queueListener, times(1)).onBookingStatusChanged(argThat(e ->
                e.getBookingId().equals(a.getId())
                        && e.getOldStatus() == BookingStatus.CONFIRMED
                        && e.getNewStatus() == BookingStatus.CHECKED_IN));
    }

    @Test
    @DisplayName("IT10-TC002 (V1) check-in คนที่สอง → Q002")
    void tc002() throws Exception {
        checkIn(a.getId());
        Booking b = booking(customer.id(), 2, "Room 2", "THAI", 60, soon(), BookingStatus.CONFIRMED);

        assertThat(checkIn(b.getId()).str("$.data.queueNumber")).isEqualTo("Q002");
    }

    @Test
    @DisplayName("IT10-TC003 (V2) check-in ซ้ำ → คิวเดิม ไม่สร้างแถวใหม่")
    void tc003() throws Exception {
        long first = checkIn(a.getId()).id("$.data.queueId");

        Res again = checkIn(a.getId());

        assertThat(again.status()).isEqualTo(200);
        assertThat(again.id("$.data.queueId")).isEqualTo(first);
        assertThat(queueRows(a.getId())).isEqualTo(1);
    }

    @Test
    @DisplayName("IT10-TC004 (I1) นัดพรุ่งนี้ → 400")
    void tc004() throws Exception {
        Booking tomorrow = booking(customer.id(), 2, "Room 2", "THAI", 60,
                LocalDate.now().plusDays(1).atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = checkIn(tomorrow.getId());

        assertThat(res.status()).as(res.toString()).isEqualTo(400);
        assertThat(res.str("$.message")).contains("scheduled date");
        assertThat(queueRows(tomorrow.getId())).isZero();
    }

    @Test
    @DisplayName("IT10-TC005 (I2) booking PENDING → 400")
    void tc005() throws Exception {
        Booking pending = booking(customer.id(), 2, "Room 2", "THAI", 60, soon(), BookingStatus.PENDING);

        Res res = checkIn(pending.getId());

        assertThat(res.status()).isEqualTo(400);
        assertThat(res.str("$.message")).isEqualTo("Only confirmed bookings can be checked in");
    }

    @Test
    @DisplayName("IT10-TC006 (V3) call-next → Q001 CALLED, Q002 ยัง WAITING")
    void tc006() throws Exception {
        checkIn(a.getId());
        Booking b = booking(customer.id(), 2, "Room 2", "THAI", 60, soon(), BookingStatus.CONFIRMED);
        checkIn(b.getId());

        Res res = POST("/api/admin/queue/call-next", receptionist(), null);

        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        assertThat(res.str("$.data.queueNumber")).isEqualTo("Q001");
        assertThat(res.str("$.data.queueStatus")).isEqualTo("CALLED");
        assertThat(res.has("$.data.calledTime")).isTrue();
        assertThat(jdbc.queryForObject("SELECT queue_status FROM queue_items WHERE booking_id = ?", String.class,
                b.getId())).isEqualTo("WAITING");
    }

    @Test
    @DisplayName("IT10-TC007 (I3) ไม่มีคิวรอ → 404")
    void tc007() throws Exception {
        assertThat(POST("/api/admin/queue/call-next", receptionist(), null).status()).isEqualTo(404);
    }

    @Test
    @DisplayName("IT10-TC008 (I4) WAITING → COMPLETED → 400 และสถานะในฐานข้อมูลไม่เปลี่ยน")
    void tc008() throws Exception {
        long queueId = checkIn(a.getId()).id("$.data.queueId");

        Res res = PATCH("/api/admin/queue/" + queueId + "/status", receptionist(), "{\"status\":\"COMPLETED\"}");

        assertThat(res.status()).isEqualTo(400);
        assertThat(jdbc.queryForObject("SELECT queue_status FROM queue_items WHERE id = ?", String.class, queueId))
                .isEqualTo("WAITING");
    }

    @Test
    @DisplayName("IT10-TC009 (V4) GET /api/admin/queue วันนี้ → Q001 ก่อน Q002")
    void tc009() throws Exception {
        checkIn(a.getId());
        Booking b = booking(customer.id(), 2, "Room 2", "THAI", 60, soon(), BookingStatus.CONFIRMED);
        checkIn(b.getId());

        Res res = GET("/api/admin/queue?date=" + LocalDate.now(), receptionist());

        List<Map<String, Object>> queue = res.list("$.data");
        assertThat(queue).extracting(q -> q.get("queueNumber")).containsExactly("Q001", "Q002");
    }

    @Test
    @Tag("known-defect")
    @DisplayName("IT10-TC010 (I5) PATCH /status CHECKED_IN ต้องได้คิวเหมือน check-in [DEF-008]")
    void tc010() throws Exception {
        Res res = PATCH("/api/bookings/" + a.getId() + "/status?status=CHECKED_IN", receptionist(), null);

        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        assertThat(queueRows(a.getId())).as("ควรมีคิวหลัง check-in (UC-14 ถูก include โดย UC-12)").isEqualTo(1);
    }

    @Test
    @DisplayName("IT10-TC011 (V4) หมอนวดเห็นคิวของตัวเอง")
    void tc011() throws Exception {
        checkIn(a.getId());

        Res res = GET("/api/therapist/me/schedule?therapistId=" + therapist(1).getId(), therapistToken(1));

        assertThat(res.status()).isEqualTo(200);
        assertThat(res.list("$.data")).extracting(q -> q.get("queueNumber")).containsExactly("Q001");
    }
}
