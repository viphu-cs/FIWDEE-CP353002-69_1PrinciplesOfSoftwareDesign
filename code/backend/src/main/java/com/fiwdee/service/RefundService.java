package com.fiwdee.service;

import com.fiwdee.dto.request.RefundRequestDTO;
import com.fiwdee.dto.response.RefundResponseDTO;
import java.util.List;

/**
 * Service interface for processing payment refunds (UC-10, Task 2.13).
 * Immutable financial audit records for refund transactions.
 */
public interface RefundService {

    /**
     * Processes a customer refund for a previously completed payment.
     */
    RefundResponseDTO processRefund(RefundRequestDTO request);

    /**
     * Retrieves the latest refund record associated with a specific payment ID.
     */
    RefundResponseDTO getRefundByPaymentId(Long paymentId);

    /**
     * Retrieves all refund records associated with a specific payment ID (e.g. partial refunds).
     */
    List<RefundResponseDTO> getRefundsByPaymentId(Long paymentId);

    /**
     * Retrieves all refunds for a specific booking ID.
     */
    List<RefundResponseDTO> getRefundsByBookingId(Long bookingId);
}
