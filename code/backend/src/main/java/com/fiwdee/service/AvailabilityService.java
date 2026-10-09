package com.fiwdee.service;

import com.fiwdee.dto.response.AvailabilityResponseDTO;
import java.time.LocalDate;

/**
 * Service calculating resource availability and available booking time slots (UC-08).
 */
public interface AvailabilityService {

    /**
     * Checks availability of therapists and rooms for a specific service and duration on a given date.
     * Takes into account shop business hours, therapist skills & work shifts, and 15-minute room cleaning buffer.
     *
     * @param date target date to check availability
     * @param serviceId ID of the requested massage service
     * @param durationMinutes requested service duration in minutes
     * @return calculated availability response containing available slots and allocated resources
     */
    AvailabilityResponseDTO checkAvailability(LocalDate date, Long serviceId, Integer durationMinutes);
}
