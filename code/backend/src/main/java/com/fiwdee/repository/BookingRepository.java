package com.fiwdee.repository;

import com.fiwdee.domain.entity.Booking;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Minimal booking access required by the front-desk module.
 * Booking-specific availability queries remain the responsibility of the booking module.
 */
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"customer", "therapist", "room", "service", "durationOption", "queueItem", "review", "payment"})
    Optional<Booking> findDetailedById(Long id);
}
