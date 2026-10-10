package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Refund;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.domain.enums.RefundStatus;
import com.fiwdee.dto.request.RefundRequestDTO;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

/** UT20 – RefundServiceImpl: เงื่อนไขอื่น (Weak Robust EC) */
@DisplayName("UT20 RefundServiceImpl – EC")
class UT20_RefundConditionTest extends RefundTestBase {

    private Refund savedRefund() {
        ArgumentCaptor<Refund> captor = ArgumentCaptor.forClass(Refund.class);
        verify(refundRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    @DisplayName("UT20-TC001 (V1) คืนแล้ว 200 → คืนอีก 400 ได้ และ Payment → REFUNDED")
    void tc001() {
        priorRefund("200.00", RefundStatus.COMPLETED);
        refundService.processRefund(refund("400.00"));
        assertThat(payment.getPaymentStatus()).isEqualTo(PaymentStatus.REFUNDED);
    }

    @Test
    @DisplayName("UT20-TC002 (V2) refund เก่า FAILED ไม่นับ → คืนได้เต็ม 600")
    void tc002() {
        priorRefund("200.00", RefundStatus.FAILED);
        refundService.processRefund(refund("600.00"));
        assertThat(payment.getPaymentStatus()).isEqualTo(PaymentStatus.REFUNDED);
    }

    @Test
    @DisplayName("UT20-TC003 (V3) processedByStaff ว่าง → \"Staff\"")
    void tc003() {
        RefundRequestDTO req = refund("100.00");
        req.setProcessedByStaff("   ");
        refundService.processRefund(req);
        assertThat(savedRefund().getProcessedByStaff()).isEqualTo("Staff");
    }

    @Test
    @DisplayName("UT20-TC004 (V4) getRefundByPaymentId คืนรายการล่าสุด")
    void tc004() {
        Refund latest = new Refund();
        latest.setId(2L);
        when(refundRepository.findTopByPaymentIdOrderByIdDesc(1L)).thenReturn(Optional.of(latest));

        refundService.getRefundByPaymentId(1L);

        verify(refundMapper).toResponseDTO(latest);
    }

    @Test
    @DisplayName("UT20-TC005 (I1) request = null / paymentId = null → ValidationException")
    void tc005() {
        assertThrows(ValidationException.class, () -> refundService.processRefund(null));
        RefundRequestDTO noId = refund("100.00");
        noId.setPaymentId(null);
        assertThrows(ValidationException.class, () -> refundService.processRefund(noId));
    }

    @Test
    @DisplayName("UT20-TC006 (I2) ไม่พบ Payment → NotFoundException")
    void tc006() {
        RefundRequestDTO req = RefundRequestDTO.builder().paymentId(999L).refundAmount(new BigDecimal("100.00")).build();
        assertThrows(NotFoundException.class, () -> refundService.processRefund(req));
    }

    @Test
    @DisplayName("UT20-TC007 (I3) Payment PENDING → ConflictException")
    void tc007() {
        payment.setPaymentStatus(PaymentStatus.PENDING);
        assertThrows(ConflictException.class, () -> refundService.processRefund(refund("100.00")));
    }

    @Test
    @DisplayName("UT20-TC008 (I4) คืนแล้ว 200 → คืน 400.01 เกินยอดคงเหลือ → ValidationException")
    void tc008() {
        priorRefund("200.00", RefundStatus.COMPLETED);
        assertThrows(ValidationException.class, () -> refundService.processRefund(refund("400.01")));
    }

    @Test
    @DisplayName("UT20-TC009 (I5) ไม่มี refund → NotFoundException")
    void tc009() {
        when(refundRepository.findTopByPaymentIdOrderByIdDesc(1L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> refundService.getRefundByPaymentId(1L));
    }

    @Test
    @DisplayName("UT20-TC010 (I6) id = null ในเมธอด get → ValidationException")
    void tc010() {
        assertThrows(ValidationException.class, () -> refundService.getRefundsByBookingId(null));
        assertThrows(ValidationException.class, () -> refundService.getRefundByPaymentId(null));
        assertThrows(ValidationException.class, () -> refundService.getRefundsByPaymentId(null));
    }
}
