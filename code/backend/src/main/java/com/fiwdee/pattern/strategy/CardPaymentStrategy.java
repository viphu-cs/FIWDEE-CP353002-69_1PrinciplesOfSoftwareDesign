package com.fiwdee.pattern.strategy;

import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import java.time.LocalDateTime;
import org.springframework.stereotype.Component;

/**
 * Concrete Payment Strategy for Credit/Debit Card processing via terminal or gateway.
 */
@Component
public class CardPaymentStrategy implements PaymentStrategy {

    @Override
    public boolean processPayment(Payment payment) {
        if (payment == null || payment.getNetAmount() == null) {
            return false;
        }
        // Simulated EDC charge success
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDateTime.now());
        }
        return true;
    }

    /**
     * Simulates charging through a credit card gateway.
     */
    public boolean chargeCreditCard(Payment payment) {
        return processPayment(payment);
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.CREDIT_CARD;
    }
}
