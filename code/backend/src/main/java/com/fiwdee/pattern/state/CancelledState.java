package com.fiwdee.pattern.state;

import com.fiwdee.domain.enums.BookingStatus;

/**
 * Terminal state for CANCELLED bookings.
 * No further lifecycle transitions are allowed.
 */
public class CancelledState extends AbstractBookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.CANCELLED;
    }
}
