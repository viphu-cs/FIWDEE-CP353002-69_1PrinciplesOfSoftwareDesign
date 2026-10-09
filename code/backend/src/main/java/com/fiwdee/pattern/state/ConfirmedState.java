package com.fiwdee.pattern.state;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;

/**
 * Concrete state for CONFIRMED bookings.
 * Allows checking in, cancelling, or marking as no-show.
 */
public class ConfirmedState extends AbstractBookingState {

    @Override
    public void checkIn(Booking booking) {
        booking.setStatus(BookingStatus.CHECKED_IN);
    }

    @Override
    public void cancel(Booking booking) {
        booking.setStatus(BookingStatus.CANCELLED);
    }

    @Override
    public void markNoShow(Booking booking) {
        booking.setStatus(BookingStatus.NO_SHOW);
    }

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.CONFIRMED;
    }
}
