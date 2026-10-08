package com.fiwdee.pattern.strategy.discount;

import com.fiwdee.domain.entity.Booking;
import java.math.BigDecimal;

/**
 * Strategy interface for promotional and discount calculation algorithms.
 * Follows GoF Strategy Pattern and Open-Closed Principle (OCP).
 */
public interface DiscountStrategy {

    /**
     * Unique promotional code recognized by this strategy (e.g., "FIWDEE20").
     */
    String getPromotionCode();

    /**
     * Verifies if this discount strategy is applicable to the given booking.
     */
    boolean isApplicable(Booking booking);

    /**
     * Calculates the monetary discount amount based on the gross amount.
     */
    BigDecimal calculateDiscount(BigDecimal grossAmount);
}
