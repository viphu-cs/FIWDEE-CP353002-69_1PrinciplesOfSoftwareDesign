package com.fiwdee.pattern.strategy.discount;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** UT17 – DiscountStrategyFactory.findStrategy – Weak Robust EC */
@DisplayName("UT17 DiscountStrategyFactory – EC")
class UT17_DiscountStrategyFactoryTest {

    private final DiscountStrategyFactory factory = new DiscountStrategyFactory(
            List.of(new PercentageDiscountStrategy(), new FixedAmountDiscountStrategy()));

    @Test
    @DisplayName("UT17-TC001 (V1) รหัสตรงตัว")
    void tc001() {
        assertThat(factory.findStrategy("FIWDEE20")).containsInstanceOf(PercentageDiscountStrategy.class);
    }

    @Test
    @DisplayName("UT17-TC002 (V2) ต่างตัวพิมพ์")
    void tc002() {
        assertThat(factory.findStrategy("welcome100")).containsInstanceOf(FixedAmountDiscountStrategy.class);
    }

    @Test
    @DisplayName("UT17-TC003 (V3) มีช่องว่างหน้า/หลัง")
    void tc003() {
        assertThat(factory.findStrategy("  FIWDEE20  ")).containsInstanceOf(PercentageDiscountStrategy.class);
    }

    @Test
    @DisplayName("UT17-TC004 (V4) รหัสซ้ำในรายการ → ใช้ตัวแรก ไม่โยน Exception")
    void tc004() {
        DiscountStrategy a = mock(DiscountStrategy.class);
        DiscountStrategy b = mock(DiscountStrategy.class);
        when(a.getPromotionCode()).thenReturn("DUP");
        when(b.getPromotionCode()).thenReturn("dup");

        DiscountStrategyFactory dupFactory = new DiscountStrategyFactory(List.of(a, b));

        assertThat(dupFactory.findStrategy("DUP")).containsSame(a);
    }

    @Test
    @DisplayName("UT17-TC005 (I1) รหัสไม่รู้จัก → empty")
    void tc005() {
        assertThat(factory.findStrategy("SALE50")).isEmpty();
    }

    @Test
    @DisplayName("UT17-TC006 (I2) null → empty")
    void tc006() {
        assertThat(factory.findStrategy(null)).isEmpty();
    }

    @Test
    @DisplayName("UT17-TC007 (I3) ว่าง / ช่องว่างล้วน → empty")
    void tc007() {
        assertThat(factory.findStrategy("")).isEmpty();
        assertThat(factory.findStrategy("   ")).isEmpty();
    }

    @Test
    @DisplayName("UT17-TC008 (I4) factory สร้างจาก null / list ว่าง → empty")
    void tc008() {
        assertThat(new DiscountStrategyFactory(null).findStrategy("FIWDEE20")).isEmpty();
        assertThat(new DiscountStrategyFactory(List.of()).findStrategy("FIWDEE20")).isEmpty();
    }
}
