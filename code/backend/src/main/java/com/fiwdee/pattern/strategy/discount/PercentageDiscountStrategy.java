package com.fiwdee.pattern.strategy.discount;

import com.fiwdee.domain.entity.Booking;
import java.math.BigDecimal;
import java.math.RoundingMode;
import org.springframework.stereotype.Component;

/**
 * Concrete Discount Strategy for percentage-based promotional discount.
 * Default campaign: "FIWDEE20" giving 20% discount on bookings.
 */
@Component
public class PercentageDiscountStrategy implements DiscountStrategy {

    private static final String PROMO_CODE = "FIWDEE20";
    private static final BigDecimal DISCOUNT_RATE = new BigDecimal("0.20");

    @Override
    public String getPromotionCode() {
        return PROMO_CODE;
    }

    @Override
    public boolean isApplicable(Booking booking) {
        // Active promo applies to any valid booking
        return booking != null && booking.getTotalPrice() != null && booking.getTotalPrice().compareTo(BigDecimal.ZERO) > 0;
    }

    @Override
    public BigDecimal calculateDiscount(BigDecimal grossAmount) {
        if (grossAmount == null || grossAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return grossAmount.multiply(DISCOUNT_RATE).setScale(2, RoundingMode.HALF_UP);
    }
}
