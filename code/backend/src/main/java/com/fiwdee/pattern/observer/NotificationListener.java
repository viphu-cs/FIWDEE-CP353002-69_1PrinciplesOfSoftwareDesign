package com.fiwdee.pattern.observer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Notification observer. The current integration logs delivery intent; an SMS/email gateway can be
 * introduced without coupling any booking or queue service to that gateway.
 */
@Component
public class NotificationListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(NotificationListener.class);

    @Async
    @EventListener
    public void onBookingStatusChanged(BookingStatusChangedEvent event) {
        LOGGER.info(
            "Booking {} changed from {} to {}; customer and therapist notification queued at {}",
            event.getBookingId(),
            event.getOldStatus(),
            event.getNewStatus(),
            event.getTimestamp()
        );
    }
}
