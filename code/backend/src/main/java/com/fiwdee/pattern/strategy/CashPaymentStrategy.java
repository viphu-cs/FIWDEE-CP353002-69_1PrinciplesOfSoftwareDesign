package com.fiwdee.pattern.strategy;

import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import java.time.LocalDateTime;
import org.springframework.stereotype.Component;

/**
 * Concrete Payment Strategy for cash transactions at front-desk.
 */
@Component
public class CashPaymentStrategy implements PaymentStrategy {

    @Override
    public boolean processPayment(Payment payment) {
        if (payment == null || payment.getNetAmount() == null) {
            return false;
        }
        payment.setPaymentStatus(PaymentStatus.COMPLETED);
        if (payment.getPaidAt() == null) {
            payment.setPaidAt(LocalDateTime.now());
        }
        return true;
    }

    @Override
    public PaymentMethod getSupportedMethod() {
        return PaymentMethod.CASH;
    }
}
