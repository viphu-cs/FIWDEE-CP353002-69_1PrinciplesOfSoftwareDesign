package com.fiwdee.dto.response;

import com.fiwdee.domain.enums.BookingStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Detailed representation of a booking for customers and administrative staff.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponseDTO {

    private Long id;
    private String bookingReferenceCode;
    private Long customerId;
    private String customerName;
    private String customerPhone;
    private Long serviceId;
    private String serviceName;
    private Long durationOptionId;
    private Integer durationMinutes;
    private BigDecimal totalPrice;
    private Long therapistId;
    private String therapistName;
    private Long roomId;
    private String roomNumber;
    private String roomType;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private BookingStatus status;
    private String paymentStatus;
    private String paymentMethod;
    private Long paymentId;
    private String bookingChannel;
    private String specialNotes;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
