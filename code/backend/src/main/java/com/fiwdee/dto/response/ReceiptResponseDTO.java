package com.fiwdee.dto.response;

import com.fiwdee.domain.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Detailed Receipt representation for customer billing and records.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptResponseDTO {

    private String receiptNumber;
    private String paymentReferenceCode;
    private String bookingReferenceCode;
    private String customerName;
    private String customerPhone;
    private String serviceName;
    private Integer durationMinutes;
    private String therapistName;
    private String roomNumber;
    private LocalDateTime serviceStartDateTime;
    private LocalDateTime serviceEndDateTime;
    private BigDecimal grossAmount;
    private BigDecimal discountAmount;
    private BigDecimal netAmount;
    private PaymentMethod paymentMethod;
    private LocalDateTime paidAt;
    private String issuedByStaff;
    private String shopName;
    private String shopAddress;
    private String shopPhone;
}
