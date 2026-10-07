package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.pattern.observer.BookingStatusChangedEvent;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.service.QueueService;
import com.fiwdee.service.TherapistExecutionService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Implements start and completion actions for the therapist who owns a queue item. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TherapistExecutionServiceImpl implements TherapistExecutionService {

    private final QueueService queueService;
    private final BookingRepository bookingRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public List<QueueItem> getMySchedule(Long therapistId) {
        return queueService.getTherapistQueue(therapistId, LocalDate.now());
    }

    @Override
    @Transactional
    public QueueItem startService(Long queueId, Long therapistId) {
        QueueItem queueItem = queueService.getQueueItem(queueId);
        Booking booking = queueItem.getBooking();
        ensureAssignedTherapist(booking, therapistId);
        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new ValidationException("Only checked-in bookings can start service");
        }
        if (queueItem.getQueueStatus() != QueueStatus.CALLED) {
            throw new ValidationException("The customer must be called before service can start");
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.IN_SERVICE);
        booking.setActualStartTime(LocalDateTime.now());
        if (booking.getRoom() != null) {
            booking.getRoom().setRoomStatus(RoomStatus.OCCUPIED);
        }
        bookingRepository.save(booking);
        QueueItem updatedQueueItem = queueService.updateQueueStatus(queueId, QueueStatus.IN_SERVICE);
        eventPublisher.publishEvent(new BookingStatusChangedEvent(this, booking.getId(), oldStatus, booking.getStatus()));
        return updatedQueueItem;
    }

    @Override
    @Transactional
    public QueueItem completeService(Long queueId, Long therapistId) {
        QueueItem queueItem = queueService.getQueueItem(queueId);
        Booking booking = queueItem.getBooking();
        ensureAssignedTherapist(booking, therapistId);
        if (booking.getStatus() != BookingStatus.IN_SERVICE || queueItem.getQueueStatus() != QueueStatus.IN_SERVICE) {
            throw new ValidationException("Only an in-service queue item can be completed");
        }

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.COMPLETED);
        booking.setActualEndTime(LocalDateTime.now());
        if (booking.getRoom() != null) {
            booking.getRoom().setRoomStatus(RoomStatus.CLEANING);
        }
        bookingRepository.save(booking);
        QueueItem updatedQueueItem = queueService.updateQueueStatus(queueId, QueueStatus.COMPLETED);
        eventPublisher.publishEvent(new BookingStatusChangedEvent(this, booking.getId(), oldStatus, booking.getStatus()));
        return updatedQueueItem;
    }

    private void ensureAssignedTherapist(Booking booking, Long therapistId) {
        if (therapistId == null || booking.getTherapist() == null || !therapistId.equals(booking.getTherapist().getId())) {
            throw new ValidationException("This queue item is not assigned to the specified therapist");
        }
    }
}
