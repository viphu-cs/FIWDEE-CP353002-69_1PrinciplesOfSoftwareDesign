package com.fiwdee.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fiwdee.service.impl.RefundServiceImpl;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Refund;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.domain.enums.RefundStatus;
import com.fiwdee.dto.request.RefundRequestDTO;
import com.fiwdee.mapper.RefundMapper;
import com.fiwdee.repository.PaymentRepository;
import com.fiwdee.repository.RefundRepository;
import com.fiwdee.testsupport.TestData;
import java.math.BigDecimal;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/** ฐานร่วม UT19–UT20: Payment#1 COMPLETED netAmount 600.00 ยังไม่เคยคืนเงิน */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
abstract class RefundTestBase {

    @Mock RefundRepository refundRepository;
    @Mock PaymentRepository paymentRepository;
    @Mock RefundMapper refundMapper;

    @InjectMocks RefundServiceImpl refundService;

    Payment payment;

    @BeforeEach
    void setUpRefund() {
        payment = TestData.payment(1, null, "600.00", PaymentStatus.COMPLETED);
        when(paymentRepository.findById(1L)).thenReturn(Optional.of(payment));
        when(paymentRepository.findById(999L)).thenReturn(Optional.empty());
        when(refundRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    RefundRequestDTO refund(String amount) {
        return RefundRequestDTO.builder()
                .paymentId(1L)
                .refundAmount(amount == null ? null : new BigDecimal(amount))
                .reason("ลูกค้ายกเลิก")
                .processedByStaff("พนักงาน 50")
                .build();
    }

    Refund priorRefund(String amount, RefundStatus status) {
        Refund r = new Refund();
        r.setPayment(payment);
        r.setRefundAmount(new BigDecimal(amount));
        r.setStatus(status);
        payment.getRefunds().add(r);
        return r;
    }
}
