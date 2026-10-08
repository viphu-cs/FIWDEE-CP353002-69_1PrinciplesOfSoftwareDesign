package com.fiwdee.pattern.strategy;

import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.PaymentMethod;

/**
 * Strategy interface for payment processing algorithms.
 * Follows GoF Strategy Pattern: decouples payment execution from presentation DTOs
 * by operating directly on the Payment domain entity.
 */
public interface PaymentStrategy {

    /**
     * Executes the payment processing for the given Payment entity.
     *
     * @param payment Domain entity representing the financial record
     * @return true if payment is successfully processed, false otherwise
     */
    boolean processPayment(Payment payment);

    /**
     * Supported payment method for this strategy.
     */
    PaymentMethod getSupportedMethod();
}
