package com.fiwdee.pattern.strategy.discount;

import static org.junit.jupiter.api.Assertions.*;

import com.fiwdee.domain.entity.Booking;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class PercentageDiscountStrategyTest {

    private PercentageDiscountStrategy discountStrategy;
    private DiscountStrategyFactory discountStrategyFactory;

    @BeforeEach
    void setUp() {
        discountStrategy = new PercentageDiscountStrategy();
        discountStrategyFactory = new DiscountStrategyFactory(List.of(discountStrategy));
    }

    @Test
    @DisplayName("FIWDEE20 should calculate exact 20% discount on gross amount")
    void testCalculateDiscount20Percent() {
        // 500 baht -> 100 baht discount
        BigDecimal discount500 = discountStrategy.calculateDiscount(new BigDecimal("500.00"));
        assertEquals(new BigDecimal("100.00"), discount500);

        // 700 baht -> 140 baht discount
        BigDecimal discount700 = discountStrategy.calculateDiscount(new BigDecimal("700.00"));
        assertEquals(new BigDecimal("140.00"), discount700);

        // 950 baht -> 190 baht discount
        BigDecimal discount950 = discountStrategy.calculateDiscount(new BigDecimal("950.00"));
        assertEquals(new BigDecimal("190.00"), discount950);
    }

    @Test
    @DisplayName("Discount should be zero for null or negative gross amounts")
    void testZeroOrNegativeGrossAmount() {
        assertEquals(BigDecimal.ZERO, discountStrategy.calculateDiscount(null));
        assertEquals(BigDecimal.ZERO, discountStrategy.calculateDiscount(BigDecimal.ZERO));
        assertEquals(BigDecimal.ZERO, discountStrategy.calculateDiscount(new BigDecimal("-100.00")));
    }

    @Test
    @DisplayName("DiscountStrategyFactory should resolve FIWDEE20 regardless of case or whitespace")
    void testFactoryResolvesPromoCode() {
        Optional<DiscountStrategy> exact = discountStrategyFactory.findStrategy("FIWDEE20");
        assertTrue(exact.isPresent());
        assertEquals("FIWDEE20", exact.get().getPromotionCode());

        Optional<DiscountStrategy> lowercase = discountStrategyFactory.findStrategy("fiwdee20");
        assertTrue(lowercase.isPresent());

        Optional<DiscountStrategy> withSpaces = discountStrategyFactory.findStrategy("  FiwDee20  ");
        assertTrue(withSpaces.isPresent());

        Optional<DiscountStrategy> unknown = discountStrategyFactory.findStrategy("UNKNOWN_CODE");
        assertTrue(unknown.isEmpty());
    }

    @Test
    @DisplayName("isApplicable should return true for valid booking with positive total price")
    void testIsApplicable() {
        Booking validBooking = Booking.builder()
                .totalPrice(new BigDecimal("500.00"))
                .build();
        assertTrue(discountStrategy.isApplicable(validBooking));

        Booking zeroBooking = Booking.builder()
                .totalPrice(BigDecimal.ZERO)
                .build();
        assertFalse(discountStrategy.isApplicable(zeroBooking));
        assertFalse(discountStrategy.isApplicable(null));
    }
}
