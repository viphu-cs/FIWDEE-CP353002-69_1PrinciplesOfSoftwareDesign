package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.request.PaymentRequestDTO;
import com.fiwdee.dto.response.PaymentResponseDTO;
import com.fiwdee.dto.response.ReceiptResponseDTO;
import com.fiwdee.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for handling payment processing and receipt generation.
 */
@Tag(name = "Payment", description = "ระบบชำระเงิน (รองรับ เงินสด, QR PromptPay, บัตรเครดิต ด้วย GoF Strategy Pattern)")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * Process payment for a booking (UC-19).
     * Accessible by Customer (for online prepayment) and Staff/Receptionist.
     */
    @PostMapping("/bookings/{id}/payment")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> processPayment(
            @PathVariable("id") Long bookingId,
            @Valid @RequestBody PaymentRequestDTO request) {

        PaymentResponseDTO response = paymentService.processPayment(bookingId, request);
        return ResponseEntity.ok(ApiResponse.success("ชำระเงินสำเร็จ", response));
    }

    /**
     * Retrieves the receipt for a completed payment transaction (UC-20).
     */
    @GetMapping("/payments/{id}/receipt")
    public ResponseEntity<ApiResponse<ReceiptResponseDTO>> getReceipt(
            @PathVariable("id") Long paymentId) {

        ReceiptResponseDTO receipt = paymentService.getReceipt(paymentId);
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลใบเสร็จรับเงินสำเร็จ", receipt));
    }

    /**
     * Retrieves payment information by booking ID.
     */
    @GetMapping("/bookings/{id}/payment")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentByBooking(
            @PathVariable("id") Long bookingId) {

        PaymentResponseDTO response = paymentService.getPaymentByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลการชำระเงินสำเร็จ", response));
    }
}
