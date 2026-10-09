package com.fiwdee.pattern.state;

import com.fiwdee.domain.enums.BookingStatus;

/**
 * Terminal state for NO_SHOW bookings.
 * No further lifecycle transitions are allowed.
 */
public class NoShowState extends AbstractBookingState {

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.NO_SHOW;
    }
}
