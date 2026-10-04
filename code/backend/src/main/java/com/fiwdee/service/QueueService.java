package com.fiwdee.service;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.enums.QueueStatus;
import java.time.LocalDate;
import java.util.List;

/** Application boundary for front-desk queue operations. */
public interface QueueService {

    List<QueueItem> getDailyQueue(LocalDate date);

    QueueItem getQueueItem(Long queueId);

    QueueItem getQueueItemForBooking(Long bookingId);

    QueueItem checkInBooking(Long bookingId);

    QueueItem generateQueueItem(Booking booking);

    QueueItem generateQueueItem(Long bookingId);

    QueueItem callNextQueue();

    QueueItem updateQueueStatus(Long queueId, QueueStatus status);

    List<QueueItem> getTherapistQueue(Long therapistId, LocalDate date);
}
