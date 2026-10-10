package com.fiwdee.repository;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long>, JpaSpecificationExecutor<Booking> {

    List<Booking> findByCustomerIdOrderByStartDateTimeDesc(Long customerId);

    /** Booking with all single-valued relations resolved (service, therapist, room, duration options, customer, payment). */
    @EntityGraph(attributePaths = {"customer", "therapist", "room", "service", "durationOption", "payment"})
    Optional<Booking> findDetailedById(Long id);

    /** A customer's bookings newest first, with the relations needed for display. */
    @EntityGraph(attributePaths = {"service", "therapist", "room", "durationOption", "payment"})
    List<Booking> findDetailedByCustomerIdOrderByStartDateTimeDesc(Long customerId);

    List<Booking> findByTherapistIdAndStartDateTimeBetween(
            Long therapistId, LocalDateTime start, LocalDateTime end);

    @Query("SELECT b FROM Booking b WHERE b.startDateTime >= :startOfDay AND b.startDateTime <= :endOfDay ORDER BY b.startDateTime ASC")
    List<Booking> findBookingsByDate(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay);
    

    /**
     * Paginated and sorted query for administrative booking overview with optional date, status, and keyword search filters.
     */
    @EntityGraph(attributePaths = {"customer", "therapist", "room", "service", "durationOption", "payment"})
    @Query(value = "SELECT b FROM Booking b "
            + "WHERE b.startDateTime >= :startOfDay "
            + "AND b.startDateTime <= :endOfDay "
            + "AND (:status IS NULL OR b.status = :status) "
            + "AND (:search = '' OR ("
            + "    LOWER(b.bookingReferenceCode) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "    OR LOWER(b.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "    OR LOWER(b.customer.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "    OR LOWER(b.service.serviceName) LIKE LOWER(CONCAT('%', :search, '%'))"
            + "))",
            countQuery = "SELECT count(b) FROM Booking b "
            + "WHERE b.startDateTime >= :startOfDay "
            + "AND b.startDateTime <= :endOfDay "
            + "AND (:status IS NULL OR b.status = :status) "
            + "AND (:search = '' OR ("
            + "    LOWER(b.bookingReferenceCode) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "    OR LOWER(b.customer.fullName) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "    OR LOWER(b.customer.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) "
            + "    OR LOWER(b.service.serviceName) LIKE LOWER(CONCAT('%', :search, '%'))"
            + "))")
    Page<Booking> findAdminBookings(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay") LocalDateTime endOfDay,
            @Param("status") BookingStatus status,
            @Param("search") String search,
            Pageable pageable);

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

    default List<Booking> findConflictingRoomBookingsWithCleaningBuffer(
            Long roomId,
            LocalDateTime startTime,
            LocalDateTime endTime,
            int cleaningBufferMinutes,
            Collection<BookingStatus> excludedStatuses) {
        return findConflictingRoomBookings(
                roomId,
                startTime.minusMinutes(cleaningBufferMinutes),
                endTime.plusMinutes(cleaningBufferMinutes),
                excludedStatuses);
    }
    
    @Query(value = "SELECT 1 FROM (SELECT pg_advisory_xact_lock(:key)) AS booking_lock", nativeQuery = true)
    Integer lockBookingDay(@Param("key") long key);
}
