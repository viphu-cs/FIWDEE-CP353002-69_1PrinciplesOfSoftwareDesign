package com.fiwdee.dto.response;

import com.fiwdee.domain.enums.RefundStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Standard response representation for Refund audit records.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefundResponseDTO {

    private Long refundId;
    private Long paymentId;
    private String paymentReferenceCode;
    private String refundReferenceCode;
    private BigDecimal refundAmount;
    private String reason;
    private RefundStatus status;
    private LocalDateTime refundedAt;
    private String processedByStaff;
}
