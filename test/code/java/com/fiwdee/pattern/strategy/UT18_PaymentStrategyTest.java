package com.fiwdee.pattern.strategy;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.exception.ValidationException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/** UT18 – PaymentStrategyFactory + Cash/QR/CardPaymentStrategy – Strong Normal EC */
@DisplayName("UT18 Payment strategies – EC")
class UT18_PaymentStrategyTest {

    private final PaymentStrategyFactory factory = new PaymentStrategyFactory(
            List.of(new CashPaymentStrategy(), new QRPaymentStrategy(), new CardPaymentStrategy()));

    private static Payment payment(String net) {
        Payment p = new Payment();
        p.setNetAmount(net == null ? null : new BigDecimal(net));
        p.setPaymentStatus(PaymentStatus.PENDING);
        return p;
    }

    @ParameterizedTest(name = "{0} getStrategy({1}) → {2}")
    @CsvSource({
        "UT18-TC001, CASH,         CashPaymentStrategy",
        "UT18-TC002, QR_PROMPTPAY, QRPaymentStrategy",
        "UT18-TC003, CREDIT_CARD,  CardPaymentStrategy"
    })
    void getStrategy(String tc, PaymentMethod method, String expectedClass) {
        PaymentStrategy strategy = factory.getStrategy(method);
        assertThat(strategy.getClass().getSimpleName()).isEqualTo(expectedClass);
        assertThat(strategy.getSupportedMethod()).isEqualTo(method);
    }

    @Test
    @DisplayName("UT18-TC004 (I1) method = null → ValidationException")
    void tc004() {
        assertThrows(ValidationException.class, () -> factory.getStrategy(null));
    }

    @Test
    @DisplayName("UT18-TC005 (I2) ไม่มี strategy ของ method นั้น → ValidationException")
    void tc005() {
        PaymentStrategyFactory cashOnly = new PaymentStrategyFactory(List.of(new CashPaymentStrategy()));
        assertThrows(ValidationException.class, () -> cashOnly.getStrategy(PaymentMethod.CREDIT_CARD));
    }

    @Test
    @DisplayName("UT18-TC006 (V4) Cash ชำระสำเร็จ → COMPLETED และตั้ง paidAt")
    void tc006() {
        Payment p = payment("480.00");
        assertThat(new CashPaymentStrategy().processPayment(p)).isTrue();
        assertThat(p.getPaymentStatus()).isEqualTo(PaymentStatus.COMPLETED);
        assertThat(p.getPaidAt()).isNotNull();
    }

    @Test
    @DisplayName("UT18-TC007 (V5) Card คง paidAt เดิม")
    void tc007() {
        Payment p = payment("480.00");
        LocalDateTime paidAt = LocalDateTime.of(2026, 11, 2, 10, 0);
        p.setPaidAt(paidAt);
        assertThat(new CardPaymentStrategy().processPayment(p)).isTrue();
        assertThat(p.getPaidAt()).isEqualTo(paidAt);
    }

    @Test
    @DisplayName("UT18-TC008 (I3) payment = null → false")
    void tc008() {
        assertThat(new QRPaymentStrategy().processPayment(null)).isFalse();
    }

    @Test
    @DisplayName("UT18-TC009 (I4) netAmount = null → false และสถานะไม่เปลี่ยน")
    void tc009() {
        Payment p = payment(null);
        assertThat(new QRPaymentStrategy().processPayment(p)).isFalse();
        assertThat(p.getPaymentStatus()).isEqualTo(PaymentStatus.PENDING);
    }

    @Test
    @DisplayName("UT18-TC010 (V4) generatePromptPayQR")
    void tc010() {
        assertThat(new QRPaymentStrategy().generatePromptPayQR(payment("480.00")))
                .isEqualTo("https://promptpay.io/0812345678/480.00");
    }
}
