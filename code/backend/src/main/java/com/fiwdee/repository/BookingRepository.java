package com.fiwdee.repository;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByCustomerIdOrderByStartDateTimeDesc(Long customerId);

    /** Booking with all single-valued relations resolved (service, therapist, room, duration options, customer). */
    @EntityGraph(attributePaths = {"customer", "therapist", "room", "service", "durationOption"})
    Optional<Booking> findDetailedById(Long id);

    /** A customer's bookings newest first, with the relations needed for display. */
    @EntityGraph(attributePaths = {"service", "therapist", "room", "durationOption"})
    List<Booking> findDetailedByCustomerIdOrderByStartDateTimeDesc(Long customerId);

    List<Booking> findByTherapistIdAndStartDateTimeBetween(
            Long therapistId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT b FROM Booking b WHERE b.startDateTime >= :startOfDay AND b.startDateTime <= :endOfDay ORDER BY b.startDateTime ASC")
    List<Booking> findBookingsByDate(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);

    @Query("SELECT b FROM Booking b WHERE b.room.id = :roomId "
            + "AND b.status NOT IN :excludedStatuses "
            + "AND ((b.startDateTime < :endTime) AND (b.endDateTime > :startTime))")
    List<Booking> findConflictingRoomBookings(
            @Param("roomId") Long roomId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludedStatuses") Collection<BookingStatus> excludedStatuses);

    @Query("SELECT b FROM Booking b WHERE b.therapist.id = :therapistId "
            + "AND b.status NOT IN :excludedStatuses "
            + "AND ((b.startDateTime < :endTime) AND (b.endDateTime > :startTime))")
    List<Booking> findConflictingTherapistBookings(
            @Param("therapistId") Long therapistId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludedStatuses") Collection<BookingStatus> excludedStatuses);
}
