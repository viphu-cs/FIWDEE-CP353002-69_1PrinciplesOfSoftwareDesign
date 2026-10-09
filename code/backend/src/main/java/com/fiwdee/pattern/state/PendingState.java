package com.fiwdee.pattern.state;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;

/**
 * Concrete state for PENDING bookings.
 * Allows confirming or cancelling the booking.
 */
public class PendingState extends AbstractBookingState {

    @Override
    public void confirm(Booking booking) {
        booking.setStatus(BookingStatus.CONFIRMED);
    }

    @Override
    public void cancel(Booking booking) {
        booking.setStatus(BookingStatus.CANCELLED);
    }

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.PENDING;
    }
}
