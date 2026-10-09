package com.fiwdee.pattern.state;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.exception.ValidationException;

/**
 * Abstract base state providing default invalid-transition guards conforming to LSP.
 */
public abstract class AbstractBookingState implements BookingState {

    @Override
    public void confirm(Booking booking) {
        throwInvalidTransition("confirm");
    }

    @Override
    public void checkIn(Booking booking) {
        throwInvalidTransition("checkIn");
    }

    @Override
    public void startService(Booking booking) {
        throwInvalidTransition("startService");
    }

    @Override
    public void complete(Booking booking) {
        throwInvalidTransition("complete");
    }

    @Override
    public void cancel(Booking booking) {
        throwInvalidTransition("cancel");
    }

    @Override
    public void markNoShow(Booking booking) {
        throwInvalidTransition("markNoShow");
    }

    protected void throwInvalidTransition(String action) {
        throw new ValidationException(
                String.format("Cannot execute action '%s' from booking status %s", action, getStatus()));
    }
}
