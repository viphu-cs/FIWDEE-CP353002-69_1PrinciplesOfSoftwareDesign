package com.fiwdee.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One booking in the authenticated customer's history (GET /api/bookings/my).
 * Dates are ISO-8601 so the frontend formats them per locale.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyBookingResponseDTO {

    private Long id;

    private String bookingReferenceCode;

    private String serviceName;

    private String therapistName;

    private String roomNumber;

    private Integer durationMinutes;

    private LocalDateTime startDateTime;

    private LocalDateTime endDateTime;

    private BigDecimal totalPrice;

    private BigDecimal discountAmount;

    private BigDecimal netAmount;

    private String paymentStatus;

    private String status;

    private LocalDateTime createdAt;
}
