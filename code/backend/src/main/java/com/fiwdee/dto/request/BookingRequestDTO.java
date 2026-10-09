package com.fiwdee.dto.request;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for creating a booking (UC-07).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingRequestDTO {

    /**
     * Optional customer ID. If omitted, resolved from the authenticated user.
     * When created by Receptionist/Owner, this may be set explicitly.
     */
    private Long customerId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Duration option ID is required")
    private Long durationOptionId;

    /**
     * Optional therapist ID. If omitted, an available therapist with matching skills is automatically assigned.
     */
    private Long therapistId;

    /**
     * Optional room ID. If omitted, an available suitable room is automatically assigned.
     */
    private Long roomId;

    @NotNull(message = "Start date time is required")
    private LocalDateTime startDateTime;

    /**
     * Booking channel: ONLINE, WALK_IN, PHONE.
     */
    private String bookingChannel;

    private String specialNotes;
}
