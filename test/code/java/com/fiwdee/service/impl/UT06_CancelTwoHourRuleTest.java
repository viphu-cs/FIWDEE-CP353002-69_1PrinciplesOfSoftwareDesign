package com.fiwdee.service.impl;

import static com.fiwdee.testsupport.TestData.NOW;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mockStatic;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.testsupport.TestData;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.MockedStatic;

/**
 * UT06 – cancelBooking: ลูกค้ายกเลิกได้เมื่อเหลือ ≥ 120 นาที (Robustness BVA ขอบด้านเดียว)
 * now = 2026-11-02 15:00 • booking CONFIRMED ของ Customer#1
 */
@DisplayName("UT06 cancelBooking – 2-hour rule BVA")
class UT06_CancelTwoHourRuleTest extends BookingWorldTestBase {

    @ParameterizedTest(name = "{0} [{1}] start {2} → cancelled={3}")
    @CsvSource({
        "UT06-TC001, nom 1440 นาที,     2026-11-03T15:00, true",
        "UT06-TC002, ขอบ-1 119 นาที,    2026-11-02T16:59, false",
        "UT06-TC003, ขอบ 120 นาที,      2026-11-02T17:00, true",
        "UT06-TC004, ขอบ+1 121 นาที,    2026-11-02T17:01, true",
        "UT06-TC005, นอกโดเมน -10 นาที, 2026-11-02T14:50, false"
    })
    void customerCancellationWindow(String tc, String boundary, LocalDateTime start, boolean cancelled) {
        Booking b = TestData.booking(40, c1, t5, r101, s1, o11, start, 60, BookingStatus.CONFIRMED);
        bookings.add(b);

        try (MockedStatic<LocalDateTime> time = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS)) {
            time.when(LocalDateTime::now).thenReturn(NOW);

            if (cancelled) {
                bookingService.cancelBooking(40L, null, c1);
            } else {
                assertThrows(ValidationException.class, () -> bookingService.cancelBooking(40L, null, c1),
                        tc + " ต้องถูกปฏิเสธ (" + boundary + ")");
            }
        }

        if (cancelled) {
            assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        } else {
            assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
            assertNotSaved();
        }
    }
}
