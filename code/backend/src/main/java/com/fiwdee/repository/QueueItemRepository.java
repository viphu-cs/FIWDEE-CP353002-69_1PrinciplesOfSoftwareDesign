package com.fiwdee.repository;

import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.enums.QueueStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository access for the daily front-desk queue. */
public interface QueueItemRepository extends JpaRepository<QueueItem, Long> {

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.therapist", "booking.room", "booking.service"})
    List<QueueItem> findByQueueDateOrderByPriorityLevelDescCheckInTimeAsc(LocalDate queueDate);

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.therapist", "booking.room", "booking.service"})
    Optional<QueueItem> findDetailedById(Long id);

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.therapist", "booking.room", "booking.service"})
    Optional<QueueItem> findDetailedByBookingId(Long bookingId);

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.therapist", "booking.room", "booking.service"})
    Optional<QueueItem> findFirstByQueueDateAndQueueStatusOrderByPriorityLevelDescCheckInTimeAsc(
        LocalDate queueDate,
        QueueStatus queueStatus
    );

    @EntityGraph(attributePaths = {"booking", "booking.customer", "booking.therapist", "booking.room", "booking.service"})
    List<QueueItem> findByBookingTherapistIdAndQueueDateOrderByPriorityLevelDescCheckInTimeAsc(
        Long therapistId,
        LocalDate queueDate
    );

    boolean existsByBookingId(Long bookingId);
}
