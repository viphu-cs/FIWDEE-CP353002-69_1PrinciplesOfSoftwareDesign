package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** IT08 – PATCH /api/bookings/{id}/cancel (Decision Table: role × เจ้าของ × เวลาที่เหลือ × สถานะ) */
@DisplayName("IT08 Cancel booking API – Decision Table")
class IT08_CancelApiTest extends IntegrationTestBase {

    private Account customer;

    @BeforeEach
    void customer() throws Exception {
        customer = registerCustomer();
    }

    private Booking startingIn(long minutes, BookingStatus status) {
        LocalDateTime start = LocalDateTime.now().plusMinutes(minutes).truncatedTo(ChronoUnit.MINUTES);
        return booking(customer.id(), 1, "Room 1", "THAI", 60, start, status);
    }

    private Res cancel(long id, String token, String body) throws Exception {
        return PATCH("/api/bookings/" + id + "/cancel", token, body);
    }

    private String notes(long id) {
        return jdbc.queryForObject("SELECT special_notes FROM bookings WHERE id = ?", String.class, id);
    }

    @Test
    @DisplayName("IT08-TC001 [R1] ลูกค้ายกเลิกของตัวเองล่วงหน้า > 2 ชม. → CANCELLED + note")
    void tc001() throws Exception {
        Booking b = booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = cancel(b.getId(), customer.token(), "{\"reason\":\"ติดธุระ\"}");

        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        assertThat(res.str("$.data.status")).isEqualTo("CANCELLED");
        assertThat(bookingStatus(b.getId())).isEqualTo("CANCELLED");
        assertThat(notes(b.getId())).endsWith("[Cancelled by CUSTOMER: ติดธุระ]");
    }

    @Test
    @DisplayName("IT08-TC002 [R2] ลูกค้ายกเลิก booking ที่เริ่มในอีก 1 ชม. → 400 และสถานะเดิม")
    void tc002() throws Exception {
        Booking b = startingIn(60, BookingStatus.CONFIRMED);

        Res res = cancel(b.getId(), customer.token(), null);

        assertThat(res.status()).as(res.toString()).isEqualTo(400);
        assertThat(res.str("$.message")).contains("at least 2 hours");
        assertThat(bookingStatus(b.getId())).isEqualTo("CONFIRMED");
    }

    @Test
    @DisplayName("IT08-TC003 [R1] เหลือ 2 ชม. 10 นาที → ยกเลิกได้")
    void tc003() throws Exception {
        Booking b = startingIn(130, BookingStatus.CONFIRMED);

        assertThat(cancel(b.getId(), customer.token(), null).status()).isEqualTo(200);
        assertThat(bookingStatus(b.getId())).isEqualTo("CANCELLED");
    }

    @Test
    @DisplayName("IT08-TC004 [R3] ลูกค้าคนอื่นยกเลิก → 403")
    void tc004() throws Exception {
        Booking b = booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = cancel(b.getId(), registerCustomer().token(), null);

        assertThat(res.status()).as(res.toString()).isEqualTo(403);
        assertThat(bookingStatus(b.getId())).isEqualTo("CONFIRMED");
    }

    @Test
    @DisplayName("IT08-TC005 [R4] receptionist ยกเลิก booking ที่เริ่มในอีก 1 ชม. → 200")
    void tc005() throws Exception {
        Booking b = startingIn(60, BookingStatus.CONFIRMED);

        Res res = cancel(b.getId(), receptionist(), "{\"reason\":\"ลูกค้าโทรแจ้ง\"}");

        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        assertThat(notes(b.getId())).endsWith("[Cancelled by RECEPTIONIST: ลูกค้าโทรแจ้ง]");
    }

    @Test
    @DisplayName("IT08-TC006 [R5] booking COMPLETED → 400 จาก State Pattern")
    void tc006() throws Exception {
        Booking b = booking(customer.id(), 1, "Room 1", "THAI", 60, LocalDateTime.now().minusDays(1),
                BookingStatus.COMPLETED);

        Res res = cancel(b.getId(), receptionist(), null);

        assertThat(res.status()).as(res.toString()).isEqualTo(400);
        assertThat(res.str("$.message")).contains("Cannot execute action");
        assertThat(bookingStatus(b.getId())).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("IT08-TC007 [R1] ไม่ส่ง body → note ใช้เหตุผลเริ่มต้น")
    void tc007() throws Exception {
        Booking b = booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        assertThat(cancel(b.getId(), customer.token(), null).status()).isEqualTo(200);
        assertThat(notes(b.getId())).endsWith("[Cancelled by CUSTOMER: Cancelled by user]");
    }

    @Test
    @Tag("known-defect")
    @DisplayName("IT08-TC008 [R1] ยกเลิก booking ที่ชำระแล้ว → ต้องคืนเงิน [DEF-007]")
    void tc008() throws Exception {
        Booking b = booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);
        Res paid = POST("/api/bookings/" + b.getId() + "/payment", receptionist(), "{\"paymentMethod\":\"CASH\"}");
        assertThat(paid.status()).isEqualTo(200);

        assertThat(cancel(b.getId(), customer.token(), null).status()).isEqualTo(200);

        int refunded = rows("SELECT COUNT(*) FROM payments p WHERE p.booking_id = ? AND (p.payment_status = 'REFUNDED' "
                + "OR EXISTS (SELECT 1 FROM refunds r WHERE r.payment_id = p.id))", b.getId());
        assertThat(refunded).as("payment ต้องถูกคืนเงิน (UC-10 A1)").isEqualTo(1);
    }
}
