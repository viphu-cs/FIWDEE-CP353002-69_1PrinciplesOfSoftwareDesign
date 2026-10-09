package com.fiwdee.pattern.state;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.exception.ValidationException;
import java.time.LocalDateTime;

/**
 * Concrete state for IN_SERVICE bookings.
 * Enforces the domain invariant that payment must be completed before service completion.
 */
public class InServiceState extends AbstractBookingState {

    @Override
    public void complete(Booking booking) {
        if (booking.getPayment() == null || booking.getPayment().getPaymentStatus() != PaymentStatus.COMPLETED) {
            throw new ValidationException(
                    "Cannot complete booking: Payment must be completed prior to finalizing the service");
        }
        booking.setStatus(BookingStatus.COMPLETED);
        if (booking.getActualEndTime() == null) {
            booking.setActualEndTime(LocalDateTime.now());
        }
    }

    @Override
    public BookingStatus getStatus() {
        return BookingStatus.IN_SERVICE;
    }
}
