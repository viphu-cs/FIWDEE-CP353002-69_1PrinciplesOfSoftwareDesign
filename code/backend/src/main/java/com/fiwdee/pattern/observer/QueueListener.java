package com.fiwdee.pattern.observer;

import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Creates one queue ticket when a booking has successfully checked in. */
@Component
@RequiredArgsConstructor
public class QueueListener {

    private final QueueService queueService;

    @EventListener
    public void onBookingStatusChanged(BookingStatusChangedEvent event) {
        if (event.getNewStatus() == BookingStatus.CHECKED_IN) {
            queueService.generateQueueItem(event.getBookingId());
        }
    }
}
