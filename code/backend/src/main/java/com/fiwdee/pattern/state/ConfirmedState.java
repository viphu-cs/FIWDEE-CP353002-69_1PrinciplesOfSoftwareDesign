package com.fiwdee.pattern.state;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ValidationException;
import java.time.LocalDateTime;

/**
 * Concrete state for CONFIRMED bookings.
 * Allows checking in, cancelling, or marking as no-show.
 */
public class ConfirmedState extends AbstractBookingState {

    private static final int NO_SHOW_GRACE_MINUTES = 15;

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
        LocalDateTime start = booking.getStartDateTime();
        if (start != null && LocalDateTime.now().isBefore(start.plusMinutes(NO_SHOW_GRACE_MINUTES))) {
            throw new ValidationException("Cannot mark as NO_SHOW until "
                    + NO_SHOW_GRACE_MINUTES + " minutes after the appointment time");
        }
        booking.setStatus(BookingStatus.NO_SHOW);
    }

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.CONFIRMED;
    }
}
