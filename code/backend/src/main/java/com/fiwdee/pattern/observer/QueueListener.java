package com.fiwdee.pattern.observer;

import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.repository.QueueItemRepository;
import com.fiwdee.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class QueueListener {

    private final QueueService queueService;
    private final QueueItemRepository queueItemRepository;

    @EventListener
    public void onBookingStatusChanged(BookingStatusChangedEvent event) {
        if (event.getNewStatus() == BookingStatus.CHECKED_IN) {
            queueService.generateQueueItem(event.getBookingId());
            return;
        }
        if (event.getOldStatus() == BookingStatus.IN_SERVICE && event.getNewStatus() == BookingStatus.COMPLETED) {
            queueItemRepository.findDetailedByBookingId(event.getBookingId())
                    .filter(q -> q.getQueueStatus() == QueueStatus.IN_SERVICE)
                    .ifPresent(q -> queueService.updateQueueStatus(q.getId(), QueueStatus.COMPLETED));
        }
    }
}