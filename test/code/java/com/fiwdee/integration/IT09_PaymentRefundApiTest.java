package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doReturn;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * IT09 – ชำระเงินและคืนเงินผ่าน API กับ Strategy จริงและ PostgreSQL (Weak Robust EC)
 * booking THAI 60 วัน D ราคา 500.00 สถานะ PENDING • Stub เฉพาะ TC011–TC012 ด้วย spy ของ CashPaymentStrategy
 */
@DisplayName("IT09 Payment & refund API – EC")
class IT09_PaymentRefundApiTest extends IntegrationTestBase {

    private Account customer;
    private Booking booking;

    @BeforeEach
    void data() throws Exception {
        customer = registerCustomer();
        booking = booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.PENDING);
    }

    private Res pay(String body) throws Exception {
        return POST("/api/bookings/" + booking.getId() + "/payment", receptionist(), body);
    }

    private long payCash() throws Exception {
        Res res = pay("{\"paymentMethod\":\"CASH\"}");
        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        return res.id("$.data.paymentId");
    }

    private Res refund(long paymentId, String amount) throws Exception {
        return POST("/api/payments/" + paymentId + "/refund", receptionist(),
                "{\"refundAmount\":" + amount + ",\"reason\":\"ลูกค้าไม่พอใจ\"}");
    }

    private String paymentStatus(long paymentId) {
        return jdbc.queryForObject("SELECT payment_status FROM payments WHERE id = ?", String.class, paymentId);
    }

    @Test
    @DisplayName("IT09-TC001 (V1) CASH → 200, payment COMPLETED ในฐานข้อมูล, booking เป็น CONFIRMED")
    void tc001() throws Exception {
        Res res = pay("{\"paymentMethod\":\"CASH\"}");

        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        assertThat(res.dec("$.data.netAmount")).isEqualByComparingTo("500.00");
        long paymentId = res.id("$.data.paymentId");
        assertThat(paymentStatus(paymentId)).isEqualTo("COMPLETED");
        assertThat(rows("SELECT COUNT(*) FROM payments WHERE id = ? AND paid_at IS NOT NULL", paymentId)).isEqualTo(1);
        assertThat(bookingStatus(booking.getId())).isEqualTo("CONFIRMED");
    }

    @Test
    @DisplayName("IT09-TC002 (V2) FIWDEE20 → ลด 100.00 เหลือ 400.00")
    void tc002() throws Exception {
        Res res = pay("{\"paymentMethod\":\"CASH\",\"promoCode\":\"FIWDEE20\"}");

        assertThat(res.dec("$.data.discountAmount")).isEqualByComparingTo("100.00");
        assertThat(res.dec("$.data.netAmount")).isEqualByComparingTo("400.00");
    }

    @Test
    @DisplayName("IT09-TC003 (V2) welcome100 (ตัวเล็ก) → ลด 100.00 เหลือ 400.00")
    void tc003() throws Exception {
        Res res = pay("{\"paymentMethod\":\"CASH\",\"promoCode\":\"welcome100\"}");

        assertThat(res.dec("$.data.discountAmount")).isEqualByComparingTo("100.00");
        assertThat(res.dec("$.data.netAmount")).isEqualByComparingTo("400.00");
    }

    @Test
    @DisplayName("IT09-TC004 (V3) โค้ดไม่ถูกต้อง → ไม่ลด")
    void tc004() throws Exception {
        Res res = pay("{\"paymentMethod\":\"CASH\",\"promoCode\":\"XYZ\"}");

        assertThat(res.status()).isEqualTo(200);
        assertThat(res.dec("$.data.discountAmount")).isEqualByComparingTo("0");
        assertThat(res.dec("$.data.netAmount")).isEqualByComparingTo("500.00");
    }

    @Test
    @DisplayName("IT09-TC005 (I1) ชำระซ้ำ → 409 และยังมี payment 1 แถว")
    void tc005() throws Exception {
        payCash();

        assertThat(pay("{\"paymentMethod\":\"CASH\"}").status()).isEqualTo(409);
        assertThat(rows("SELECT COUNT(*) FROM payments WHERE booking_id = ?", booking.getId())).isEqualTo(1);
    }

    @Test
    @DisplayName("IT09-TC006 (V4) ใบเสร็จตรงกับฐานข้อมูลและมีชื่อร้าน")
    void tc006() throws Exception {
        long paymentId = payCash();

        Res res = GET("/api/payments/" + paymentId + "/receipt", receptionist());

        assertThat(res.status()).isEqualTo(200);
        String receiptInDb = jdbc.queryForObject("SELECT receipt_number FROM payments WHERE id = ?", String.class, paymentId);
        assertThat(res.str("$.data.receiptNumber")).isEqualTo(receiptInDb);
        assertThat(res.str("$.data.shopName")).isEqualTo("FIWDEE Massage");
    }

    @Test
    @DisplayName("IT09-TC007 (V5) คืนบางส่วน 200 → refund 1 แถว, payment ยัง COMPLETED")
    void tc007() throws Exception {
        long paymentId = payCash();

        Res res = refund(paymentId, "200");

        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        assertThat(rows("SELECT COUNT(*) FROM refunds WHERE payment_id = ? AND status = 'COMPLETED'", paymentId)).isEqualTo(1);
        assertThat(paymentStatus(paymentId)).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("IT09-TC008 (I2) คืน 200 แล้วคืนอีก 301 (เกินยอดคงเหลือ 300) → 400")
    void tc008() throws Exception {
        long paymentId = payCash();
        assertThat(refund(paymentId, "200").status()).isEqualTo(200);

        Res res = refund(paymentId, "301");

        assertThat(res.status()).as(res.toString()).isEqualTo(400);
        assertThat(res.str("$.message")).contains("(300.00)");
        assertThat(jdbc.queryForObject("SELECT SUM(refund_amount) FROM refunds WHERE payment_id = ?",
                java.math.BigDecimal.class, paymentId)).isEqualByComparingTo("200");
    }

    @Test
    @DisplayName("IT09-TC009 (V5) คืน 200 แล้วคืนอีก 300 (ครบยอด) → payment REFUNDED")
    void tc009() throws Exception {
        long paymentId = payCash();
        assertThat(refund(paymentId, "200").status()).isEqualTo(200);

        assertThat(refund(paymentId, "300").status()).isEqualTo(200);

        assertThat(paymentStatus(paymentId)).isEqualTo("REFUNDED");
    }

    @Test
    @DisplayName("IT09-TC010 (I3) id ใน URL ไม่ตรงกับ body → 400")
    void tc010() throws Exception {
        long paymentId = payCash();

        Res res = POST("/api/payments/" + paymentId + "/refund", receptionist(),
                "{\"paymentId\":" + (paymentId + 1000) + ",\"refundAmount\":100,\"reason\":\"x\"}");

        assertThat(res.status()).isEqualTo(400);
        assertThat(res.str("$.message")).startsWith("Payment ID in URL");
    }

    @Test
    @DisplayName("IT09-TC011 (I4) Stub: ช่องทางชำระล้มเหลว → 400 และ booking ยัง PENDING")
    void tc011() throws Exception {
        doReturn(false).when(cashPaymentStrategy).processPayment(any());

        Res res = pay("{\"paymentMethod\":\"CASH\"}");

        assertThat(res.status()).as(res.toString()).isEqualTo(400);
        assertThat(res.str("$.message")).startsWith("Payment execution failed");
        assertThat(bookingStatus(booking.getId())).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("IT09-TC012 (I4) Stub: ชำระล้มเหลวต้องเหลือ payment FAILED เป็นหลักฐาน [DEF-018]")
    void tc012() throws Exception {
        doReturn(false).when(cashPaymentStrategy).processPayment(any());

        pay("{\"paymentMethod\":\"CASH\"}");

        assertThat(rows("SELECT COUNT(*) FROM payments WHERE booking_id = ? AND payment_status = 'FAILED'",
                booking.getId())).as("ควรมีหลักฐานการชำระที่ล้มเหลว").isEqualTo(1);
    }

    @Test
    @DisplayName("IT09-TC013 (I5) ชำระ booking ที่ถูกยกเลิก → 400 [DEF-003]")
    void tc013() throws Exception {
        jdbc.update("UPDATE bookings SET status = 'CANCELLED' WHERE id = ?", booking.getId());

        assertThat(pay("{\"paymentMethod\":\"CASH\"}").status()).isEqualTo(400);
    }

    @Test
    @DisplayName("IT09-TC014 (I6) ลูกค้าคนอื่นดู payment → 403 [DEF-016]")
    void tc014() throws Exception {
        payCash();

        Res res = GET("/api/bookings/" + booking.getId() + "/payment", registerCustomer().token());

        assertThat(res.status()).as(res.toString()).isEqualTo(403);
    }

    @Test
    @DisplayName("IT09-TC015 (V6) รายงานรายได้วันนี้ดึงยอดจริงจากฐานข้อมูล")
    void tc015() throws Exception {
        LocalDate today = LocalDate.now();
        long paymentId = payCash();
        assertThat(refund(paymentId, "200").status()).isEqualTo(200);

        // ช่วงถึงพรุ่งนี้ เผื่อเทสต์รันคร่อมเที่ยงคืน
        Res res = GET("/api/admin/reports/revenue?startDate=" + today + "&endDate=" + today.plusDays(1), owner());

        assertThat(res.status()).isEqualTo(200);
        assertThat(res.dec("$.data.netRevenue")).isEqualByComparingTo("500.00");
        assertThat(res.dec("$.data.refundedTotal")).isEqualByComparingTo("200.00");
        assertThat(res.id("$.data.totalCompletedBookings")).isEqualTo(1);
    }
}
