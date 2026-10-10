package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.exception.ValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * UT14 – processPayment: ส่วนลด และสถานะ booking หลังชำระ (Weak Robust EC)
 * ใช้ DiscountStrategyFactory ตัวจริง (FIWDEE20, WELCOME100)
 * หมายเหตุ DEF-002: ควร publish BookingStatusChangedEvent เมื่อสถานะเปลี่ยน แต่ PaymentServiceImpl ไม่มี publisher ให้ตรวจ
 */
@DisplayName("UT14 processPayment – Promo & booking status EC")
class UT14_PaymentPromoStatusTest extends PaymentTestBase {

    @ParameterizedTest(name = "{0} totalPrice {1}, promo [{2}] → discount {3}, net {4}")
    @CsvSource(value = {
        "UT14-TC001 | 600.00 | NULL           | 0      | 600.00",
        "UT14-TC002 | 600.00 | FIWDEE20       | 120.00 | 480.00",
        "UT14-TC003 | 600.00 | WELCOME100     | 100.00 | 500.00",
        "UT14-TC004 | 600.00 | ' fiwdee20 '   | 120.00 | 480.00",
        "UT14-TC005 | 600.00 | SALE50         | 0      | 600.00",
        "UT14-TC006 | 250.00 | WELCOME100     | 0      | 250.00"
    }, delimiter = '|', nullValues = "NULL")
    void promo(String tc, String total, String promo, String discount, String net) {
        price(total);

        paymentService.processPayment(10L, pay(PaymentMethod.CASH, promo));

        Payment p = savedPayment();
        assertThat(p.getDiscountAmount()).isEqualByComparingTo(discount);
        assertThat(p.getNetAmount()).isEqualByComparingTo(net);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    @DisplayName("UT14-TC007 (V5) PENDING → CONFIRMED หลังชำระ")
    void tc007() {
        booking.setStatus(BookingStatus.PENDING);
        paymentService.processPayment(10L, pay(PaymentMethod.QR_PROMPTPAY, null));
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    @DisplayName("UT14-TC008 (V7) IN_SERVICE → COMPLETED หลังชำระ")
    void tc008() {
        booking.setStatus(BookingStatus.IN_SERVICE);
        paymentService.processPayment(10L, pay(PaymentMethod.CASH, null));
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.COMPLETED);
    }

    @Test
    @Tag("known-defect")
    @DisplayName("UT14-TC009 (I3) CHECKED_IN ต้องคง CHECKED_IN ห้ามข้ามไป COMPLETED (DEF-001)")
    void tc009() {
        booking.setStatus(BookingStatus.CHECKED_IN);
        paymentService.processPayment(10L, pay(PaymentMethod.CASH, null));
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CHECKED_IN);
    }

    @Test
    @Tag("known-defect")
    @DisplayName("UT14-TC010 (I4) booking CANCELLED ห้ามรับเงิน (DEF-003)")
    void tc010() {
        booking.setStatus(BookingStatus.CANCELLED);
        assertThrows(ValidationException.class, () -> paymentService.processPayment(10L, pay(PaymentMethod.CASH, null)));
    }

    @Test
    @Tag("known-defect")
    @DisplayName("UT14-TC011 (I4) booking NO_SHOW ห้ามรับเงิน (DEF-003)")
    void tc011() {
        booking.setStatus(BookingStatus.NO_SHOW);
        assertThrows(ValidationException.class, () -> paymentService.processPayment(10L, pay(PaymentMethod.CASH, null)));
    }
}
