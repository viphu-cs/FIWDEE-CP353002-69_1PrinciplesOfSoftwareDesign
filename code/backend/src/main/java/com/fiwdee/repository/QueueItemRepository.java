package com.fiwdee.repository;

import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.enums.QueueStatus;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface QueueItemRepository extends JpaRepository<QueueItem, Long> {

    List<QueueItem> findByQueueDateOrderByQueueNumberAsc(LocalDate queueDate);

    List<QueueItem> findByQueueDateAndQueueStatusOrderByQueueNumberAsc(LocalDate queueDate, QueueStatus queueStatus);

    Optional<QueueItem> findByBookingId(Long bookingId);
}
