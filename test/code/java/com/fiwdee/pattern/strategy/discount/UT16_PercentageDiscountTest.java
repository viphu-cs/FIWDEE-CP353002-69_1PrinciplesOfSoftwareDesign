package com.fiwdee.pattern.strategy.discount;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.entity.Booking;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/** UT16 – PercentageDiscountStrategy (FIWDEE20) – Weak Robust EC (กลุ่มการปัดเศษ) */
@DisplayName("UT16 PercentageDiscountStrategy – EC")
class UT16_PercentageDiscountTest {

    private final PercentageDiscountStrategy strategy = new PercentageDiscountStrategy();

    @ParameterizedTest(name = "{0} calculateDiscount({1}) = {2}")
    @CsvSource({
        "UT16-TC001, 600.00, 120.00",
        "UT16-TC002, 0.01,   0.00",
        "UT16-TC003, 0.03,   0.01",
        "UT16-TC004, 0.025,  0.01",
        "UT16-TC006, 0.00,   0",
        "UT16-TC007, -10.00, 0"
    })
    void calculateDiscount(String tc, String gross, String expected) {
        BigDecimal result = strategy.calculateDiscount(new BigDecimal(gross));
        assertThat(result).isEqualByComparingTo(expected);
    }

    @Test
    @DisplayName("UT16-TC001 (เพิ่มเติม) ผลลัพธ์มีทศนิยม 2 ตำแหน่ง")
    void scaleIsTwo() {
        assertThat(strategy.calculateDiscount(new BigDecimal("600.00")).scale()).isEqualTo(2);
    }

    @Test
    @DisplayName("UT16-TC005 (V4) booking ราคา > 0 → isApplicable = true")
    void tc005() {
        assertThat(strategy.isApplicable(Booking.builder().totalPrice(new BigDecimal("600.00")).build())).isTrue();
    }

    @Test
    @DisplayName("UT16-TC008 (I3) gross = null → 0")
    void tc008() {
        assertThat(strategy.calculateDiscount(null)).isEqualByComparingTo("0");
    }

    @Test
    @DisplayName("UT16-TC009 (I4) ราคา 0 / null / booking null → isApplicable = false")
    void tc009() {
        assertThat(strategy.isApplicable(Booking.builder().totalPrice(BigDecimal.ZERO).build())).isFalse();
        assertThat(strategy.isApplicable(Booking.builder().totalPrice(null).build())).isFalse();
        assertThat(strategy.isApplicable(null)).isFalse();
    }
}
