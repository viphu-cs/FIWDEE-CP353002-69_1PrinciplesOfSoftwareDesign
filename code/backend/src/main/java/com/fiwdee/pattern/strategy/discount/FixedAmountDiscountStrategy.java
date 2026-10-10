package com.fiwdee.pattern.strategy.discount;

import com.fiwdee.domain.entity.Booking;
import java.math.BigDecimal;
import org.springframework.stereotype.Component;

/**
 * Concrete Discount Strategy for fixed monetary amount discounts.
 * Default campaign: "WELCOME100" providing a 100 THB discount.
 */
@Component
public class FixedAmountDiscountStrategy implements DiscountStrategy {

    private static final String PROMO_CODE = "WELCOME100";
    private static final BigDecimal FIXED_DISCOUNT = new BigDecimal("100.00");
    private static final BigDecimal MINIMUM_AMOUNT = new BigDecimal("300.00");

    @Override
    public String getPromotionCode() {
        return PROMO_CODE;
    }

    @Override
    public boolean isApplicable(Booking booking) {
        return booking != null 
                && booking.getTotalPrice() != null 
                && booking.getTotalPrice().compareTo(MINIMUM_AMOUNT) >= 0;
    }

    @Override
    public BigDecimal calculateDiscount(BigDecimal grossAmount) {
        if (grossAmount == null || grossAmount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        // Discount cannot exceed the gross amount
        return grossAmount.min(FIXED_DISCOUNT);
    }
}
