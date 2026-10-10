package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

import com.fiwdee.domain.entity.Refund;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.domain.enums.RefundStatus;
import com.fiwdee.exception.ValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;

/** UT19 – RefundServiceImpl.processRefund: จำนวนเงินคืน 0 < amount ≤ 600.00 (Robustness BVA) */
@DisplayName("UT19 processRefund – refundAmount Robustness BVA")
class UT19_RefundAmountTest extends RefundTestBase {

    @ParameterizedTest(name = "{0} refundAmount {1} → accepted={2}, payment {3}")
    @CsvSource({
        "UT19-TC001, 0.00,   false, COMPLETED",
        "UT19-TC002, 0.01,   true,  COMPLETED",
        "UT19-TC003, 0.02,   true,  COMPLETED",
        "UT19-TC004, 300.00, true,  COMPLETED",
        "UT19-TC005, 599.99, true,  COMPLETED",
        "UT19-TC006, 600.00, true,  REFUNDED",
        "UT19-TC007, 600.01, false, COMPLETED"
    })
    void refundAmount(String tc, String amount, boolean accepted, PaymentStatus paymentAfter) {
        if (accepted) {
            refundService.processRefund(refund(amount));

            ArgumentCaptor<Refund> saved = ArgumentCaptor.forClass(Refund.class);
            verify(refundRepository).save(saved.capture());
            assertThat(saved.getValue().getRefundAmount()).isEqualByComparingTo(amount);
            assertThat(saved.getValue().getStatus()).isEqualTo(RefundStatus.COMPLETED);
            assertThat(saved.getValue().getRefundReferenceCode()).startsWith("REF-");
        } else {
            assertThrows(ValidationException.class, () -> refundService.processRefund(refund(amount)));
            verify(refundRepository, never()).save(any());
        }
        assertThat(payment.getPaymentStatus()).isEqualTo(paymentAfter);
    }
}
