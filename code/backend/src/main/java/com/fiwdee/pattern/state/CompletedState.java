package com.fiwdee.pattern.state;

import com.fiwdee.domain.enums.BookingStatus;

/**
 * Terminal state for COMPLETED bookings.
 * No further lifecycle transitions are allowed.
 */
public class CompletedState extends AbstractBookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.COMPLETED;
    }
}
