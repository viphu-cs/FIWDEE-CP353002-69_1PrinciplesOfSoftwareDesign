package com.fiwdee.service;

import com.fiwdee.dto.request.PaymentRequestDTO;
import com.fiwdee.dto.response.PaymentResponseDTO;
import com.fiwdee.dto.response.ReceiptResponseDTO;

/**
 * Service interface for processing customer payments and issuing receipts.
 * Immutable financial audit records (Payment entity is never updated after completion).
 */
public interface PaymentService {

    /**
     * Processes payment for a booking using GoF Strategy Pattern
     * (with DiscountStrategy for promotional discount calculations).
     */
    PaymentResponseDTO processPayment(Long bookingId, PaymentRequestDTO request);

    /**
     * Retrieves the official receipt for a completed payment transaction.
     */
    ReceiptResponseDTO getReceipt(Long paymentId);

    /**
     * Retrieves the payment details by booking ID.
     */
    PaymentResponseDTO getPaymentByBookingId(Long bookingId);
}
