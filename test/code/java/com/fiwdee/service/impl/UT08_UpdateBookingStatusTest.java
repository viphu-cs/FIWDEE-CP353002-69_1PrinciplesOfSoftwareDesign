package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.testsupport.TestData;
import java.time.LocalDateTime;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** UT08 (ต่อ) – BookingServiceImpl.updateBookingStatus: 2 เคสสุดท้ายของชีต UT08 */
@DisplayName("UT08 updateBookingStatus")
class UT08_UpdateBookingStatusTest extends BookingWorldTestBase {

    @Test
    @DisplayName("UT08-TC044 updateBookingStatus(PENDING) → ValidationException")
    void tc044() {
        Booking b = TestData.booking(10, c1, t5, r101, s1, o11, START, 60, BookingStatus.CONFIRMED);
        bookings.add(b);

        assertThrows(ValidationException.class,
                () -> bookingService.updateBookingStatus(10L, BookingStatus.PENDING, TestData.receptionist(50)));
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertNotSaved();
    }

    @Test
    @Tag("known-defect")
    @DisplayName("UT08-TC045 NO_SHOW ก่อนเลยเวลานัด 15 นาที → ValidationException (DEF-009)")
    void tc045() {
        Booking b = TestData.booking(10, c1, t5, r101, s1, o11, LocalDateTime.now().plusDays(1), 60, BookingStatus.CONFIRMED);
        bookings.add(b);

        assertThrows(ValidationException.class,
                () -> bookingService.updateBookingStatus(10L, BookingStatus.NO_SHOW, TestData.receptionist(50)));
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
    }

    @Test
    @DisplayName("UT08-TC046 updateBookingStatus(CHECKED_IN) → publish event CONFIRMED → CHECKED_IN (DEF-008)")
    void tc046() {
        Booking b = TestData.booking(10, c1, t5, r101, s1, o11, START, 60, BookingStatus.CONFIRMED);
        bookings.add(b);

        bookingService.updateBookingStatus(10L, BookingStatus.CHECKED_IN, TestData.receptionist(50));

        assertThat(b.getStatus()).isEqualTo(BookingStatus.CHECKED_IN);
        org.mockito.ArgumentCaptor<Object> event = org.mockito.ArgumentCaptor.forClass(Object.class);
        org.mockito.Mockito.verify(eventPublisher).publishEvent(event.capture());
        assertThat(event.getValue()).isInstanceOfSatisfying(
                com.fiwdee.pattern.observer.BookingStatusChangedEvent.class, e -> {
                    assertThat(e.getBookingId()).isEqualTo(10L);
                    assertThat(e.getOldStatus()).isEqualTo(BookingStatus.CONFIRMED);
                    assertThat(e.getNewStatus()).isEqualTo(BookingStatus.CHECKED_IN);
                });
    }
}
