package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Shop;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.dto.request.PaymentRequestDTO;
import com.fiwdee.dto.response.PaymentResponseDTO;
import com.fiwdee.dto.response.ReceiptResponseDTO;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.PaymentMapper;
import com.fiwdee.pattern.strategy.PaymentStrategy;
import com.fiwdee.pattern.strategy.PaymentStrategyFactory;
import com.fiwdee.pattern.strategy.discount.DiscountStrategy;
import com.fiwdee.pattern.strategy.discount.DiscountStrategyFactory;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.PaymentRepository;
import com.fiwdee.repository.ShopRepository;
import com.fiwdee.service.PaymentService;
import com.fiwdee.pattern.observer.BookingStatusChangedEvent;
import org.springframework.context.ApplicationEventPublisher;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of PaymentService adhering strictly to Layered Architecture,
 * GoF Strategy Pattern, and immutable audit logs.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final ShopRepository shopRepository;
    private final PaymentStrategyFactory paymentStrategyFactory;
    private final DiscountStrategyFactory discountStrategyFactory;
    private final PaymentMapper paymentMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public PaymentResponseDTO processPayment(Long bookingId, PaymentRequestDTO request) {
        if (bookingId == null) {
            throw new ValidationException("Booking ID cannot be null");
        }
        if (request == null || request.getPaymentMethod() == null) {
            throw new ValidationException("Payment method is required");
        }

        // 1. Fetch detailed booking
        Booking booking = bookingRepository.findDetailedById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking not found with ID: " + bookingId));

        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.NO_SHOW) {
            throw new ValidationException(
                    "Cannot accept payment for a " + booking.getStatus() + " booking");
        }
        
        // 2. Idempotency & Conflict Check: Each Booking has at most 1 Payment (1:1 settledBy)
        Optional<Payment> existingPayment = paymentRepository.findByBookingId(bookingId);
        if (existingPayment.isPresent()) {
            Payment p = existingPayment.get();
            if (p.getPaymentStatus() == PaymentStatus.COMPLETED) {
                throw new ConflictException("Payment for this booking has already been completed (Reference: " 
                        + p.getPaymentReferenceCode() + ")");
            }
        }

        // 3. Determine Gross Amount directly from Booking entity
        BigDecimal grossAmount = booking.getTotalPrice();
        if (grossAmount == null || grossAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Invalid booking total price: " + grossAmount);
        }

        // 4. Calculate Discount via DiscountStrategy (Open-Closed Principle)
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (request.getPromoCode() != null && !request.getPromoCode().trim().isEmpty()) {
            Optional<DiscountStrategy> discountStrategyOpt = discountStrategyFactory.findStrategy(request.getPromoCode());
            if (discountStrategyOpt.isPresent()) {
                DiscountStrategy discountStrategy = discountStrategyOpt.get();
                if (discountStrategy.isApplicable(booking)) {
                    discountAmount = discountStrategy.calculateDiscount(grossAmount);
                    log.info("Applied promo code [{}] with discount: {}", request.getPromoCode(), discountAmount);
                }
            } else {
                log.warn("Promo code [{}] is invalid or expired. No discount applied.", request.getPromoCode());
            }
        }

        // Discount cannot exceed gross amount
        if (discountAmount.compareTo(grossAmount) > 0) {
            discountAmount = grossAmount;
        }

        BigDecimal netAmount = grossAmount.subtract(discountAmount);

        // 5. Build Payment Audit Entity
        String paymentRefCode = "PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String receiptNumber = "REC-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Payment payment = Payment.builder()
                .booking(booking)
                .paymentReferenceCode(paymentRefCode)
                .receiptNumber(receiptNumber)
                .grossAmount(grossAmount)
                .discountAmount(discountAmount)
                .netAmount(netAmount)
                .paymentMethod(request.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .transactionNote(request.getTransactionNote())
                .build();

        // 6. Execute Settlement via GoF Payment Strategy
        PaymentStrategy paymentStrategy = paymentStrategyFactory.getStrategy(request.getPaymentMethod());
        boolean success = paymentStrategy.processPayment(payment);
        if (!success) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            throw new ValidationException("Payment execution failed for method: " + request.getPaymentMethod());
        }

        // 7. Save Immutable Audit Record
        Payment savedPayment = paymentRepository.save(payment);

        // 8. Update Booking status to COMPLETED (if physically in service or completed)
        // Or CONFIRMED if pre-paid online booking
        BookingStatus oldStatus = booking.getStatus();
        booking.setPayment(savedPayment);
        if (oldStatus == BookingStatus.PENDING) {
            booking.confirm();
        } else if (oldStatus == BookingStatus.IN_SERVICE) {
            booking.complete();
        }

        bookingRepository.save(booking);

        if (booking.getStatus() != oldStatus) {
            eventPublisher.publishEvent(new BookingStatusChangedEvent(
                    this, booking.getId(), oldStatus, booking.getStatus()));
        }

        log.info("Payment successfully settled: ID={}, Ref={}, NetAmount={}", 
                savedPayment.getId(), savedPayment.getPaymentReferenceCode(), savedPayment.getNetAmount());

        return paymentMapper.toResponseDTO(savedPayment);
    }

    @Override
    @Transactional(readOnly = true)
    public ReceiptResponseDTO getReceipt(Long paymentId) {
        if (paymentId == null) {
            throw new ValidationException("Payment ID cannot be null");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("Payment record not found with ID: " + paymentId));

        Shop shop = shopRepository.findAll().stream().findFirst().orElse(null);

        return paymentMapper.toReceiptDTO(payment, shop);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentByBookingId(Long bookingId) {
        if (bookingId == null) {
            throw new ValidationException("Booking ID cannot be null");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new NotFoundException("Payment record not found for booking ID: " + bookingId));

        return paymentMapper.toResponseDTO(payment);
    }
}
