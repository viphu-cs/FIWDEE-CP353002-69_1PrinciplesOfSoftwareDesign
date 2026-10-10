package com.fiwdee.pattern.strategy.discount;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.entity.Booking;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/** UT15 – FixedAmountDiscountStrategy (WELCOME100) – Robustness BVA */
@DisplayName("UT15 FixedAmountDiscountStrategy – Robustness BVA")
class UT15_FixedAmountDiscountTest {

    private final FixedAmountDiscountStrategy strategy = new FixedAmountDiscountStrategy();

    private static Booking withPrice(String price) {
        return Booking.builder().totalPrice(price == null ? null : new BigDecimal(price)).build();
    }

    @ParameterizedTest(name = "{0} isApplicable(totalPrice {1}) = {2}")
    @CsvSource({
        "UT15-TC001, 299.99, false",
        "UT15-TC002, 300.00, true",
        "UT15-TC003, 300.01, true",
        "UT15-TC004, 600.00, true"
    })
    void isApplicable(String tc, String price, boolean expected) {
        assertThat(strategy.isApplicable(withPrice(price))).isEqualTo(expected);
    }

    @Test
    @DisplayName("UT15-TC005 totalPrice null / booking null → false")
    void tc005() {
        assertThat(strategy.isApplicable(withPrice(null))).isFalse();
        assertThat(strategy.isApplicable(null)).isFalse();
    }

    @ParameterizedTest(name = "{0} calculateDiscount({1}) = {2}")
    @CsvSource({
        "UT15-TC006, 0.00,   0",
        "UT15-TC007, 0.01,   0.01",
        "UT15-TC008, 0.02,   0.02",
        "UT15-TC009, 50.00,  50.00",
        "UT15-TC010, 99.99,  99.99",
        "UT15-TC011, 100.00, 100.00",
        "UT15-TC012, 100.01, 100.00"
    })
    void calculateDiscount(String tc, String gross, String expected) {
        assertThat(strategy.calculateDiscount(new BigDecimal(gross))).isEqualByComparingTo(expected);
    }

    @Test
    @DisplayName("UT15-TC013 gross null / ติดลบ → 0")
    void tc013() {
        assertThat(strategy.calculateDiscount(null)).isEqualByComparingTo("0");
        assertThat(strategy.calculateDiscount(new BigDecimal("-1.00"))).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("UT15-TC014 getPromotionCode() = WELCOME100")
    void tc014() {
        assertThat(strategy.getPromotionCode()).isEqualTo("WELCOME100");
    }
}
