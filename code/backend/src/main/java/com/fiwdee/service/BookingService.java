package com.fiwdee.service;

import com.fiwdee.dto.response.MyBookingResponseDTO;
import java.util.List;

/** Booking business logic for the customer-facing side. */
public interface BookingService {

    /** The customer's own bookings, newest first (GET /api/bookings/my). */
    List<MyBookingResponseDTO> getMyBookings(Long customerId);
}
