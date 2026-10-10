package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.pattern.observer.BookingStatusChangedEvent;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.QueueItemRepository;
import com.fiwdee.service.QueueService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Transactional implementation of the front-desk queue workflow. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QueueServiceImpl implements QueueService {

    private final QueueItemRepository queueItemRepository;
    private final BookingRepository bookingRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    public List<QueueItem> getDailyQueue(LocalDate date) {
        LocalDate queueDate = date == null ? LocalDate.now() : date;
        return queueItemRepository.findByQueueDateOrderByPriorityLevelDescCheckInTimeAsc(queueDate);
    }

    @Override
    public QueueItem getQueueItem(Long queueId) {
        return queueItemRepository.findDetailedById(queueId)
            .orElseThrow(() -> new NotFoundException("Queue item " + queueId + " was not found"));
    }

    @Override
    public QueueItem getQueueItemForBooking(Long bookingId) {
        return queueItemRepository.findDetailedByBookingId(bookingId)
            .orElseThrow(() -> new NotFoundException("No queue item exists for booking " + bookingId));
    }

    @Override
    @Transactional
    public QueueItem checkInBooking(Long bookingId) {
        Booking booking = bookingRepository.findDetailedById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking " + bookingId + " was not found"));

        if (booking.getStatus() == BookingStatus.CHECKED_IN) {
            if (queueItemRepository.existsByBookingId(bookingId)) {
                return getQueueItemForBooking(bookingId);
            }
            return generateQueueItem(booking);
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new ValidationException("Only confirmed bookings can be checked in");
        }
        validateCheckInTime(booking);

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(BookingStatus.CHECKED_IN);
        bookingRepository.save(booking);
        eventPublisher.publishEvent(new BookingStatusChangedEvent(this, booking.getId(), oldStatus, booking.getStatus()));

        return getQueueItemForBooking(booking.getId());
    }

    @Override
    @Transactional
    public QueueItem generateQueueItem(Long bookingId) {
        if (queueItemRepository.existsByBookingId(bookingId)) {
            return getQueueItemForBooking(bookingId);
        }
        Booking booking = bookingRepository.findDetailedById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking " + bookingId + " was not found"));
        return generateQueueItem(booking);
    }

    @Override
    @Transactional
    public QueueItem generateQueueItem(Booking booking) {
        if (booking == null || booking.getId() == null) {
            throw new ValidationException("A persisted booking is required to generate a queue item");
        }
        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            throw new ValidationException("A queue item can only be created after check-in");
        }
        if (queueItemRepository.existsByBookingId(booking.getId())) {
            return getQueueItemForBooking(booking.getId());
        }

        LocalDate queueDate = booking.getStartDateTime() == null ? LocalDate.now() : booking.getStartDateTime().toLocalDate();
        String queueNumber = nextQueueNumber(queueDate);
        QueueItem queueItem = QueueItem.builder()
            .booking(booking)
            .queueNumber(queueNumber)
            .queueDate(queueDate)
            .checkInTime(LocalDateTime.now())
            .queueStatus(QueueStatus.WAITING)
            .priorityLevel(0)
            .build();

        QueueItem savedQueueItem = queueItemRepository.save(queueItem);
        booking.setQueueItem(savedQueueItem);
        return savedQueueItem;
    }

    @Override
    @Transactional
    public QueueItem callNextQueue() {
        LocalDate today = LocalDate.now();
        QueueItem nextQueueItem = queueItemRepository
            .findFirstByQueueDateAndQueueStatusOrderByPriorityLevelDescCheckInTimeAsc(today, QueueStatus.WAITING)
            .orElseThrow(() -> new NotFoundException("There are no waiting customers in today's queue"));
        nextQueueItem.setQueueStatus(QueueStatus.CALLED);
        nextQueueItem.setCalledTime(LocalDateTime.now());
        return queueItemRepository.save(nextQueueItem);
    }

    @Override
    @Transactional
    public QueueItem updateQueueStatus(Long queueId, QueueStatus status) {
        if (status == null) {
            throw new ValidationException("Queue status is required");
        }
        QueueItem queueItem = getQueueItem(queueId);
        QueueStatus currentStatus = queueItem.getQueueStatus();
        if (currentStatus == status) {
            return queueItem;
        }
        if (!isAllowedTransition(currentStatus, status)) {
            throw new ValidationException(
                "Queue status cannot transition from " + currentStatus + " to " + status
            );
        }

        queueItem.setQueueStatus(status);
        if (status == QueueStatus.CALLED && queueItem.getCalledTime() == null) {
            queueItem.setCalledTime(LocalDateTime.now());
        }
        return queueItemRepository.save(queueItem);
    }

    @Override
    public List<QueueItem> getTherapistQueue(Long therapistId, LocalDate date) {
        if (therapistId == null) {
            throw new ValidationException("Therapist id is required");
        }
        LocalDate queueDate = date == null ? LocalDate.now() : date;
        return queueItemRepository.findByBookingTherapistIdAndQueueDateOrderByPriorityLevelDescCheckInTimeAsc(
            therapistId,
            queueDate
        );
    }

    private void validateCheckInTime(Booking booking) {
        if (booking.getStartDateTime() == null) {
            throw new ValidationException("Booking does not have a scheduled start time");
        }
        LocalDateTime now = LocalDateTime.now();
        if (!booking.getStartDateTime().toLocalDate().equals(now.toLocalDate())) {
            throw new ValidationException("A booking can only be checked in on its scheduled date");
        }
    }

    private String nextQueueNumber(LocalDate queueDate) {
        int nextNumber = queueItemRepository.findByQueueDateOrderByPriorityLevelDescCheckInTimeAsc(queueDate)
            .stream()
            .mapToInt(this::extractQueueNumber)
            .max()
            .orElse(0) + 1;
        return String.format(Locale.ROOT, "Q%03d", nextNumber);
    }

    private int extractQueueNumber(QueueItem queueItem) {
        String queueNumber = queueItem.getQueueNumber();
        if (queueNumber == null) {
            return 0;
        }
        String numericPart = queueNumber.replaceAll("[^0-9]", "");
        if (numericPart.isBlank()) {
            return 0;
        }
        try {
            return Integer.parseInt(numericPart);
        } catch (NumberFormatException exception) {
            return 0;
        }
    }

    private boolean isAllowedTransition(QueueStatus currentStatus, QueueStatus requestedStatus) {
        return switch (currentStatus) {
            case WAITING -> requestedStatus == QueueStatus.CALLED || requestedStatus == QueueStatus.IN_SERVICE || requestedStatus == QueueStatus.CANCELLED;
            case CALLED -> requestedStatus == QueueStatus.IN_SERVICE || requestedStatus == QueueStatus.CANCELLED;
            case IN_SERVICE -> requestedStatus == QueueStatus.COMPLETED;
            case COMPLETED, CANCELLED -> false;
        };
    }
}
