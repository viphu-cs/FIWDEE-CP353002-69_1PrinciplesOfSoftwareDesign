package com.fiwdee.service;

import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.dto.request.BookingRequestDTO;
import com.fiwdee.dto.request.CancelBookingRequestDTO;
import com.fiwdee.dto.response.BookingResponseDTO;
import com.fiwdee.dto.response.MyBookingResponseDTO;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service managing the core booking lifecycle, creation, cancellation, and retrieval.
 */
public interface BookingService {

    /**
     * Creates a new booking with resource allocation and concurrency control (UC-07).
     */
    BookingResponseDTO createBooking(BookingRequestDTO requestDTO, User currentUser);

    /**
     * Retrieves a booking by its ID, enforcing role-based ownership checks (UC-09).
     */
    BookingResponseDTO getBookingById(Long id, User currentUser);

    /**
     * Retrieves the customer's own bookings, newest first.
     */
    List<MyBookingResponseDTO> getMyBookings(Long customerId);

    /**
     * Cancels a booking via the State Pattern, enforcing customer cancellation policy (UC-10).
     */
    BookingResponseDTO cancelBooking(Long id, CancelBookingRequestDTO dto, User currentUser);

    /**
     * Transitions a booking to a new lifecycle state using the State Pattern.
     */
    BookingResponseDTO updateBookingStatus(Long id, BookingStatus newStatus, User currentUser);

    /**
     * Retrieves all bookings for a given date for front-desk and administration (UC-09).
     */
    List<BookingResponseDTO> getAdminBookings(LocalDate date);

    /**
     * Retrieves paginated and sorted bookings with optional date, status, and keyword search filters (UC-09).
     */
    Page<BookingResponseDTO> getAdminBookings(
            LocalDate date, BookingStatus status, String search, Pageable pageable);
}
