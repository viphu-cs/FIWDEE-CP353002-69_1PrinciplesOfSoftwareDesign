package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Refund;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.domain.enums.RefundStatus;
import com.fiwdee.dto.request.RefundRequestDTO;
import com.fiwdee.dto.response.RefundResponseDTO;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.RefundMapper;
import com.fiwdee.repository.PaymentRepository;
import com.fiwdee.repository.RefundRepository;
import com.fiwdee.service.RefundService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of RefundService ensuring financial integrity and immutable refund trails.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RefundServiceImpl implements RefundService {

    private final RefundRepository refundRepository;
    private final PaymentRepository paymentRepository;
    private final RefundMapper refundMapper;

    @Override
    @Transactional
    public RefundResponseDTO processRefund(RefundRequestDTO request) {
        if (request == null || request.getPaymentId() == null) {
            throw new ValidationException("Payment ID is required for refund processing");
        }
        if (request.getRefundAmount() == null || request.getRefundAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ValidationException("Refund amount must be greater than zero");
        }

        // 1. Verify Payment existence & completed status
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new NotFoundException("Payment not found with ID: " + request.getPaymentId()));

        if (payment.getPaymentStatus() != PaymentStatus.COMPLETED && payment.getPaymentStatus() != PaymentStatus.REFUNDED) {
            throw new ConflictException("Cannot refund a payment that is not COMPLETED (Current status: " 
                    + payment.getPaymentStatus() + ")");
        }

        // 2. Validate refund amount vs. net amount paid and prior refunds
        List<Refund> priorRefunds = payment.getRefunds();
        BigDecimal totalAlreadyRefunded = priorRefunds.stream()
                .filter(r -> r.getStatus() == RefundStatus.COMPLETED)
                .map(Refund::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal remainingRefundable = payment.getNetAmount().subtract(totalAlreadyRefunded);
        if (request.getRefundAmount().compareTo(remainingRefundable) > 0) {
            throw new ValidationException("Refund amount (" + request.getRefundAmount() 
                    + ") exceeds maximum remaining refundable balance (" + remainingRefundable + ")");
        }

        // 3. Create immutable Refund Audit Entity
        String refundRefCode = "REF-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String staff = request.getProcessedByStaff() != null && !request.getProcessedByStaff().isBlank() 
                ? request.getProcessedByStaff() : "Staff";

        Refund refund = Refund.builder()
                .payment(payment)
                .refundReferenceCode(refundRefCode)
                .refundAmount(request.getRefundAmount())
                .reason(request.getReason())
                .status(RefundStatus.COMPLETED)
                .refundedAt(LocalDateTime.now())
                .processedByStaff(staff)
                .build();

        Refund savedRefund = refundRepository.save(refund);

        // 4. Update parent Payment status to REFUNDED if fully refunded
        BigDecimal newTotalRefunded = totalAlreadyRefunded.add(request.getRefundAmount());
        if (newTotalRefunded.compareTo(payment.getNetAmount()) >= 0) {
            payment.setPaymentStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        }

        log.info("Processed refund: ID={}, Ref={}, Amount={}, PaymentRef={}",
                savedRefund.getId(), savedRefund.getRefundReferenceCode(), savedRefund.getRefundAmount(),
                payment.getPaymentReferenceCode());

        return refundMapper.toResponseDTO(savedRefund);
    }

    @Override
    @Transactional(readOnly = true)
    public RefundResponseDTO getRefundByPaymentId(Long paymentId) {
        if (paymentId == null) {
            throw new ValidationException("Payment ID cannot be null");
        }
        Refund refund = refundRepository.findTopByPaymentIdOrderByIdDesc(paymentId)
                .orElseThrow(() -> new NotFoundException("No refund record found for payment ID: " + paymentId));
        return refundMapper.toResponseDTO(refund);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponseDTO> getRefundsByPaymentId(Long paymentId) {
        if (paymentId == null) {
            throw new ValidationException("Payment ID cannot be null");
        }
        return refundRepository.findByPaymentIdOrderByIdDesc(paymentId).stream()
                .map(refundMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RefundResponseDTO> getRefundsByBookingId(Long bookingId) {
        if (bookingId == null) {
            throw new ValidationException("Booking ID cannot be null");
        }
        return refundRepository.findByPaymentBookingId(bookingId).stream()
                .map(refundMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
