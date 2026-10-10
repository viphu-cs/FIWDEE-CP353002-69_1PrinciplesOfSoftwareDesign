package com.fiwdee.pattern.state;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;

/**
 * State interface for the GoF State Pattern managing the booking lifecycle.
 */
public interface BookingState {

    void confirm(Booking booking);

    void checkIn(Booking booking);

    void startService(Booking booking);

    void complete(Booking booking);

    void cancel(Booking booking);

    void markNoShow(Booking booking);

    BookingStatus getStatus();
}
