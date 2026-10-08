package com.fiwdee.pattern.strategy;

import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import java.time.LocalDateTime;
import org.springframework.stereotype.Component;

/**
 * Concrete Payment Strategy for QR PromptPay transactions.
 * Simulates PromptPay dynamic QR generation and slip verification.
 */
@Component
public class QRPaymentStrategy implements PaymentStrategy {

    @Override
    public boolean processPayment(Payment payment) {
        if (payment == null || payment.getNetAmount() == null) {
            return false;
        }
        // Simulated slip verification success
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDateTime.now());
        }
        return true;
    }

    /**
     * Generates simulated PromptPay QR payload / URL for the given Payment.
     */
    public String generatePromptPayQR(Payment payment) {
        if (payment == null) return null;
        return "https://promptpay.io/0812345678/" + payment.getNetAmount();
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.QR_PROMPTPAY;
    }
}
