package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.testsupport.TestData;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** UT13 – PaymentServiceImpl.processPayment: เงื่อนไขและผลการชำระ (Decision Table, Limited Entry) */
@DisplayName("UT13 processPayment – Decision Table")
class UT13_ProcessPaymentTest extends PaymentTestBase {

    @Test
    @DisplayName("UT13-TC001 [R1] bookingId = null → ValidationException")
    void tc001() {
        assertThrows(ValidationException.class, () -> paymentService.processPayment(null, pay(PaymentMethod.CASH, null)));
        verifyNoInteractions(bookingRepository, paymentRepository);
    }

    @Test
    @DisplayName("UT13-TC002 [R2] paymentMethod = null → ValidationException")
    void tc002() {
        assertThrows(ValidationException.class, () -> paymentService.processPayment(10L, pay(null, null)));
        assertThrows(ValidationException.class, () -> paymentService.processPayment(10L, null));
    }

    @Test
    @DisplayName("UT13-TC003 [R3] ไม่พบ booking → NotFoundException")
    void tc003() {
        assertThrows(NotFoundException.class, () -> paymentService.processPayment(999L, pay(PaymentMethod.CASH, null)));
    }

    @Test
    @DisplayName("UT13-TC004 [R4] มี Payment COMPLETED อยู่แล้ว → ConflictException")
    void tc004() {
        Payment old = TestData.payment(1, null, "600.00", PaymentStatus.COMPLETED);
        when(paymentRepository.findByBookingId(10L)).thenReturn(Optional.of(old));

        assertThrows(ConflictException.class, () -> paymentService.processPayment(10L, pay(PaymentMethod.QR_PROMPTPAY, null)));
        verify(paymentStrategyFactory, never()).getStrategy(any());
    }

    @Test
    @DisplayName("UT13-TC005 [R5] totalPrice = 0.00 → ValidationException")
    void tc005() {
        price("0.00");
        assertThrows(ValidationException.class, () -> paymentService.processPayment(10L, pay(PaymentMethod.CASH, null)));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT13-TC006 [R6] strategy ล้มเหลว → save Payment FAILED แล้วโยน ValidationException")
    void tc006() {
        strategySucceeds(false);

        assertThrows(ValidationException.class, () -> paymentService.processPayment(10L, pay(PaymentMethod.CREDIT_CARD, null)));

        verify(paymentRepository, times(1)).save(any());
        assertThat(savedPayment().getPaymentStatus()).isEqualTo(PaymentStatus.FAILED);
        assertThat(booking.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    @DisplayName("UT13-TC007 [R7] ชำระเงินสดสำเร็จ")
    void tc007() {
        paymentService.processPayment(10L, pay(PaymentMethod.CASH, null));

        Payment p = savedPayment();
        assertThat(p.getPaymentStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(p.getGrossAmount()).isEqualByComparingTo("600.00");
        assertThat(p.getDiscountAmount()).isEqualByComparingTo("0");
        assertThat(p.getNetAmount()).isEqualByComparingTo("600.00");
        assertThat(p.getPaymentMethod()).isEqualTo(PaymentMethod.CASH);
        assertThat(p.getPaymentReferenceCode()).startsWith("PAY-");
        assertThat(p.getReceiptNumber()).startsWith("REC-");
        assertThat(p.getBooking()).isSameAs(booking);
    }

    @Test
    @DisplayName("UT13-TC008 [R8] มี Payment เดิมสถานะ FAILED → ชำระใหม่ได้")
    void tc008() {
        Payment old = TestData.payment(1, null, "600.00", PaymentStatus.FAILED);
        when(paymentRepository.findByBookingId(10L)).thenReturn(Optional.of(old));

        paymentService.processPayment(10L, pay(PaymentMethod.CASH, null));

        assertThat(savedPayment().getPaymentStatus()).isEqualTo(PaymentStatus.COMPLETED);
    }
}
