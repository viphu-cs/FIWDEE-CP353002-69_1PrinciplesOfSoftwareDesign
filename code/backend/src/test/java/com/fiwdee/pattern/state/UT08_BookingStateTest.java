package com.fiwdee.pattern.state;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.exception.ValidationException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * UT08 – Booking State Pattern (Extended Entry Decision Table แบบตารางสถานะ)
 * 7 สถานะ × 6 action = 42 ช่อง + guard ของ complete() ที่ต้องชำระเงินก่อน = 43 เคส
 * (UT08-TC044, TC045 อยู่ใน service/impl/UT08_UpdateBookingStatusTest)
 */
@DisplayName("UT08 Booking State Pattern – State Transition Table")
class UT08_BookingStateTest {

    private static Booking booking(BookingStatus status, PaymentStatus paymentStatus) {
        Booking booking = Booking.builder()
                .id(1L)
                .bookingReferenceCode("BK-20261109-ABC123")
                .startDateTime(LocalDateTime.now().minusMinutes(16))
                .endDateTime(LocalDateTime.now().plusMinutes(44))
                .totalPrice(new BigDecimal("600.00"))
                .status(status)
                .build();
        Payment payment = new Payment();
        payment.setId(1L);
        payment.setBooking(booking);
        payment.setNetAmount(new BigDecimal("600.00"));
        payment.setPaymentStatus(paymentStatus);
        booking.setPayment(payment);
        return booking;
    }

    private static void perform(Booking booking, String action) {
        switch (action) {
            case "confirm" -> booking.confirm();
            case "checkIn" -> booking.checkIn();
            case "startService" -> booking.startService();
            case "complete" -> booking.complete();
            case "cancel" -> booking.cancel();
            case "markNoShow" -> booking.markNoShow();
            default -> throw new IllegalArgumentException("unknown action " + action);
        }
    }

    /** expected = สถานะปลายทาง หรือ INVALID (ต้องโยน ValidationException และสถานะคงเดิม) */
    @ParameterizedTest(name = "{0}: {1}.{2}() [payment {3}] → {4}")
    @CsvSource({
        "UT08-TC001, PENDING   , confirm     , COMPLETED, CONFIRMED",
        "UT08-TC002, PENDING   , checkIn     , COMPLETED, INVALID",
        "UT08-TC003, PENDING   , startService, COMPLETED, INVALID",
        "UT08-TC004, PENDING   , complete    , COMPLETED, INVALID",
        "UT08-TC005, PENDING   , cancel      , COMPLETED, CANCELLED",
        "UT08-TC006, PENDING   , markNoShow  , COMPLETED, INVALID",
        "UT08-TC007, CONFIRMED , confirm     , COMPLETED, INVALID",
        "UT08-TC008, CONFIRMED , checkIn     , COMPLETED, CHECKED_IN",
        "UT08-TC009, CONFIRMED , startService, COMPLETED, INVALID",
        "UT08-TC010, CONFIRMED , complete    , COMPLETED, INVALID",
        "UT08-TC011, CONFIRMED , cancel      , COMPLETED, CANCELLED",
        "UT08-TC012, CONFIRMED , markNoShow  , COMPLETED, NO_SHOW",
        "UT08-TC013, CHECKED_IN, confirm     , COMPLETED, INVALID",
        "UT08-TC014, CHECKED_IN, checkIn     , COMPLETED, INVALID",
        "UT08-TC015, CHECKED_IN, startService, COMPLETED, IN_SERVICE",
        "UT08-TC016, CHECKED_IN, complete    , COMPLETED, INVALID",
        "UT08-TC017, CHECKED_IN, cancel      , COMPLETED, CANCELLED",
        "UT08-TC018, CHECKED_IN, markNoShow  , COMPLETED, INVALID",
        "UT08-TC019, IN_SERVICE, confirm     , COMPLETED, INVALID",
        "UT08-TC020, IN_SERVICE, checkIn     , COMPLETED, INVALID",
        "UT08-TC021, IN_SERVICE, startService, COMPLETED, INVALID",
        "UT08-TC022, IN_SERVICE, complete    , COMPLETED, COMPLETED",
        "UT08-TC023, IN_SERVICE, complete    , PENDING,   INVALID",
        "UT08-TC024, IN_SERVICE, cancel      , COMPLETED, INVALID",
        "UT08-TC025, IN_SERVICE, markNoShow  , COMPLETED, INVALID",
        "UT08-TC026, COMPLETED , confirm     , COMPLETED, INVALID",
        "UT08-TC027, COMPLETED , checkIn     , COMPLETED, INVALID",
        "UT08-TC028, COMPLETED , startService, COMPLETED, INVALID",
        "UT08-TC029, COMPLETED , complete    , COMPLETED, INVALID",
        "UT08-TC030, COMPLETED , cancel      , COMPLETED, INVALID",
        "UT08-TC031, COMPLETED , markNoShow  , COMPLETED, INVALID",
        "UT08-TC032, CANCELLED , confirm     , COMPLETED, INVALID",
        "UT08-TC033, CANCELLED , checkIn     , COMPLETED, INVALID",
        "UT08-TC034, CANCELLED , startService, COMPLETED, INVALID",
        "UT08-TC035, CANCELLED , complete    , COMPLETED, INVALID",
        "UT08-TC036, CANCELLED , cancel      , COMPLETED, INVALID",
        "UT08-TC037, CANCELLED , markNoShow  , COMPLETED, INVALID",
        "UT08-TC038, NO_SHOW   , confirm     , COMPLETED, INVALID",
        "UT08-TC039, NO_SHOW   , checkIn     , COMPLETED, INVALID",
        "UT08-TC040, NO_SHOW   , startService, COMPLETED, INVALID",
        "UT08-TC041, NO_SHOW   , complete    , COMPLETED, INVALID",
        "UT08-TC042, NO_SHOW   , cancel      , COMPLETED, INVALID",
        "UT08-TC043, NO_SHOW   , markNoShow  , COMPLETED, INVALID"
    })
    void transition(String tc, BookingStatus from, String action, PaymentStatus payment, String expected) {
        Booking booking = booking(from, payment);

        if ("INVALID".equals(expected)) {
            ValidationException ex = assertThrows(ValidationException.class, () -> perform(booking, action),
                    tc + ": " + from + "." + action + "() ต้องถูกปฏิเสธ");
            assertThat(booking.getStatus()).as("สถานะต้องไม่เปลี่ยน").isEqualTo(from);
            if (!(from == BookingStatus.IN_SERVICE && "complete".equals(action))) {
                assertThat(ex.getMessage()).contains(action).contains(from.name());
            }
        } else {
            perform(booking, action);
            assertThat(booking.getStatus()).isEqualTo(BookingStatus.valueOf(expected));
            if ("startService".equals(action)) {
                assertThat(booking.getActualStartTime()).isNotNull();
            }
            if ("complete".equals(action)) {
                assertThat(booking.getActualEndTime()).isNotNull();
            }
        }
    }
}
