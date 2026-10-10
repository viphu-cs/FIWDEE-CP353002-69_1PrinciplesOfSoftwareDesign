package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.exception.ValidationException;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.MockedStatic;

/**
 * UT21 – QueueServiceImpl.checkInBooking: check-in ได้ไม่เกิน 30 นาทีก่อนนัด และต้องเป็นวันเดียวกัน
 * (Robustness BVA ขอบด้านเดียว) • นัด 2026-11-02 14:00 • now ถูกตรึงตามแต่ละเคส
 */
@DisplayName("UT21 checkInBooking – 30-minute window BVA")
class UT21_CheckInWindowTest extends QueueTestBase {

    private static final LocalDateTime START = LocalDateTime.of(2026, 11, 2, 14, 0);

    @ParameterizedTest(name = "{0} now {1} → accepted={2}")
    @CsvSource({
        "UT21-TC001, 2026-11-02T13:50, true",
        "UT21-TC002, 2026-11-02T13:29, false",
        "UT21-TC003, 2026-11-02T13:30, true",
        "UT21-TC004, 2026-11-02T13:31, true",
        "UT21-TC005, 2026-11-01T13:50, false",
        "UT21-TC006, 2026-11-02T15:00, true"
    })
    void checkInWindow(String tc, LocalDateTime now, boolean accepted) {
        Booking b = booking(10, START, BookingStatus.CONFIRMED);
        when(queueItemRepository.findDetailedByBookingId(10L))
                .thenReturn(Optional.of(queue(1, b, "Q001", QueueStatus.WAITING)));

        try (MockedStatic<LocalDateTime> time = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS)) {
            time.when(LocalDateTime::now).thenReturn(now);

            if (accepted) {
                queueService.checkInBooking(10L);
            } else {
                assertThrows(ValidationException.class, () -> queueService.checkInBooking(10L), tc);
            }
        }

        if (accepted) {
            assertThat(b.getStatus()).isEqualTo(BookingStatus.CHECKED_IN);
            assertThat(events()).hasSize(1);
            assertThat(events().get(0).getNewStatus()).isEqualTo(BookingStatus.CHECKED_IN);
        } else {
            assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
            assertThat(events()).isEmpty();
        }
    }
}
