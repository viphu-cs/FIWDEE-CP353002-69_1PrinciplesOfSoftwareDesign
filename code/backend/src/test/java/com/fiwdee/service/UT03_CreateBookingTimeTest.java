package com.fiwdee.service;

import static com.fiwdee.testsupport.TestData.NOW;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mockStatic;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ValidationException;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.MockedStatic;

/**
 * UT03 – createBooking: ช่วงเวลาที่จองได้ (Robustness BVA)
 * now ถูกตรึงที่ 2026-11-02 15:00 ด้วย mockStatic(LocalDateTime) • ร้านเปิด 10:00–22:00 • บริการ 60 นาที
 * เคสที่ต้องถูกปฏิเสธแยกไว้ใน rejected() และติด @Tag("known-defect") เพราะโค้ดปัจจุบันยังไม่ตรวจเวลา (DEF-004)
 */
@DisplayName("UT03 createBooking – Time window Robustness BVA")
class UT03_CreateBookingTimeTest extends BookingWorldTestBase {

    @ParameterizedTest(name = "{0} [{1}] start {2} → จองได้")
    @CsvSource({
        "UT03-TC001, 'lead nom / time nom', 2026-11-09T15:30",
        "UT03-TC003, lead min,              2026-11-02T15:30",
        "UT03-TC004, lead min+,             2026-11-02T15:31",
        "UT03-TC005, lead max-,             2026-11-16T14:59",
        "UT03-TC006, lead max,              2026-11-16T15:00",
        "UT03-TC009, time min,              2026-11-09T10:00",
        "UT03-TC010, time min+,             2026-11-09T10:01",
        "UT03-TC011, time max-,             2026-11-09T20:59",
        "UT03-TC012, time max,              2026-11-09T21:00"
    })
    void accepted(String tc, String boundary, LocalDateTime start) {
        try (MockedStatic<LocalDateTime> time = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS)) {
            time.when(LocalDateTime::now).thenReturn(NOW);

            bookingService.createBooking(request(null, 1L, 11L, 5L, null, start), c1);
        }
        Booking b = savedBooking();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(b.getEndDateTime()).isEqualTo(start.plusMinutes(60));
    }

    @ParameterizedTest(name = "{0} [{1}] start {2} → ต้องถูกปฏิเสธ (DEF-004)")
    @CsvSource({
        "UT03-TC002, lead min-,  2026-11-02T15:29",
        "UT03-TC007, lead max+,  2026-11-16T15:01",
        "UT03-TC008, time min-,  2026-11-09T09:59",
        "UT03-TC013, time max+,  2026-11-09T21:01"
    })
    void rejected(String tc, String boundary, LocalDateTime start) {
        try (MockedStatic<LocalDateTime> time = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS)) {
            time.when(LocalDateTime::now).thenReturn(NOW);

            assertThrows(ValidationException.class,
                    () -> bookingService.createBooking(request(null, 1L, 11L, 5L, null, start), c1),
                    tc + " ต้องถูกปฏิเสธ (" + boundary + ")");
        }
        assertNotSaved();
    }
}
