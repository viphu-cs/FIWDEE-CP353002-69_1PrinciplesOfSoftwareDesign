package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Refund;
import com.fiwdee.dto.response.RefundResponseDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper for Refund entity and presentation DTOs.
 */
@Component
public class RefundMapper {

    public RefundResponseDTO toResponseDTO(Refund refund) {
        if (refund == null) {
            return null;
        }

        Long paymentId = null;
        String paymentRef = null;
        if (refund.getPayment() != null) {
            paymentId = refund.getPayment().getId();
            paymentRef = refund.getPayment().getPaymentReferenceCode();
        }

        return RefundResponseDTO.builder()
                .refundId(refund.getId())
                .paymentId(paymentId)
                .paymentReferenceCode(paymentRef)
                .refundReferenceCode(refund.getRefundReferenceCode())
                .refundAmount(refund.getRefundAmount())
                .reason(refund.getReason())
                .status(refund.getStatus())
                .refundedAt(refund.getRefundedAt())
                .processedByStaff(refund.getProcessedByStaff())
                .build();
    }
}
