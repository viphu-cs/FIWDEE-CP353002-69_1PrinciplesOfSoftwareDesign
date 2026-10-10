package com.fiwdee.service.impl;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mockingDetails;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.dto.request.PaymentRequestDTO;
import com.fiwdee.mapper.PaymentMapper;
import com.fiwdee.pattern.strategy.PaymentStrategy;
import com.fiwdee.pattern.strategy.PaymentStrategyFactory;
import com.fiwdee.pattern.strategy.discount.DiscountStrategyFactory;
import com.fiwdee.pattern.strategy.discount.FixedAmountDiscountStrategy;
import com.fiwdee.pattern.strategy.discount.PercentageDiscountStrategy;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.PaymentRepository;
import com.fiwdee.repository.ShopRepository;
import com.fiwdee.testsupport.TestData;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;

/** ฐานร่วมของ UT13–UT14: Booking#10 ราคา 600.00 • strategy (mock) ชำระสำเร็จเป็นค่าเริ่มต้น */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
abstract class PaymentTestBase {

    @Mock PaymentRepository paymentRepository;
    @Mock BookingRepository bookingRepository;
    @Mock ShopRepository shopRepository;
    @Mock PaymentStrategyFactory paymentStrategyFactory;
    @Mock PaymentStrategy paymentStrategy;
    @Mock PaymentMapper paymentMapper;
    /** เตรียมไว้ให้ constructor ใหม่หลังแก้ DEF-002 (publish event เมื่อสถานะเปลี่ยน) */
    @Mock ApplicationEventPublisher eventPublisher;
    @Spy DiscountStrategyFactory discountStrategyFactory = new DiscountStrategyFactory(
            List.of(new PercentageDiscountStrategy(), new FixedAmountDiscountStrategy()));

    @InjectMocks PaymentServiceImpl paymentService;

    Booking booking;

    @BeforeEach
    void setUpPayment() {
        booking = TestData.booking(10, TestData.customer(1), null, null, null, null,
                TestData.DAY.atTime(15, 30), 60, BookingStatus.CONFIRMED);
        when(bookingRepository.findDetailedById(10L)).thenReturn(Optional.of(booking));
        when(bookingRepository.findDetailedById(999L)).thenReturn(Optional.empty());
        when(paymentRepository.findByBookingId(any())).thenReturn(Optional.empty());
        when(paymentRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(paymentStrategyFactory.getStrategy(any())).thenReturn(paymentStrategy);
        strategySucceeds(true);
    }

    /**
     * ใช้ doAnswer().when(...) แทน when(...).thenAnswer(...)
     * เพราะ when(mock.method(any())) จะ "เรียก" stub เดิมด้วย argument null ระหว่างตั้ง stub ใหม่
     * แล้ว answer เดิม (p.setPaymentStatus) โยน NullPointerException
     */
    void strategySucceeds(boolean success) {
        doAnswer(i -> {
            Payment p = i.getArgument(0);
            if (success) {
                p.setPaymentStatus(PaymentStatus.COMPLETED);
            }
            return success;
        }).when(paymentStrategy).processPayment(any());
    }

    void price(String amount) {
        booking.setTotalPrice(new BigDecimal(amount));
    }

    PaymentRequestDTO pay(PaymentMethod method, String promo) {
        return PaymentRequestDTO.builder().paymentMethod(method).promoCode(promo).build();
    }

    /** Payment ตัวสุดท้ายที่ถูก save */
    Payment savedPayment() {
        return mockingDetails(paymentRepository).getInvocations().stream()
                .filter(i -> i.getMethod().getName().equals("save"))
                .map(i -> (Payment) i.getArguments()[0])
                .reduce((a, b) -> b)
                .orElseThrow(() -> new AssertionError("paymentRepository.save ไม่ถูกเรียก"));
    }
}
