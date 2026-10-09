package com.fiwdee.pattern.state;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import java.time.LocalDateTime;

/**
 * Concrete state for CHECKED_IN bookings.
 * Allows starting the service or cancelling.
 */
public class CheckedInState extends AbstractBookingState {

    @Override
    public void startService(Booking booking) {
        booking.setStatus(BookingStatus.IN_SERVICE);
        if (booking.getActualStartTime() == null) {
            booking.setActualStartTime(LocalDateTime.now());
        }
    }

    @Override
    public void cancel(Booking booking) {
        booking.setStatus(BookingStatus.CANCELLED);
    }

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.CHECKED_IN;
    }
}
