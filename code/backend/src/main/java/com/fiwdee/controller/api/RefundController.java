package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.request.RefundRequestDTO;
import com.fiwdee.dto.response.RefundResponseDTO;
import com.fiwdee.service.RefundService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for managing refund processing and audit queries (UC-10, Task 2.13).
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RefundController {

    private final RefundService refundService;

    /**
     * Process a refund for a payment (Role: OWNER, RECEPTIONIST).
     */
    @PostMapping("/payments/{id}/refund")
    public ResponseEntity<ApiResponse<RefundResponseDTO>> processRefund(
            @PathVariable("id") Long paymentId,
            @Valid @RequestBody RefundRequestDTO request) {

        request.setPaymentId(paymentId);
        RefundResponseDTO response = refundService.processRefund(request);
        return ResponseEntity.ok(ApiResponse.success("ประมวลผลการคืนเงินสำเร็จ", response));
    }

    /**
     * Retrieves the refund record for a payment ID.
     */
    @GetMapping("/payments/{id}/refund")
    public ResponseEntity<ApiResponse<RefundResponseDTO>> getRefundByPayment(
            @PathVariable("id") Long paymentId) {

        RefundResponseDTO response = refundService.getRefundByPaymentId(paymentId);
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลการคืนเงินสำเร็จ", response));
    }

    /**
     * Retrieves all refunds associated with a booking ID.
     */
    @GetMapping("/bookings/{id}/refunds")
    public ResponseEntity<ApiResponse<List<RefundResponseDTO>>> getRefundsByBooking(
            @PathVariable("id") Long bookingId) {

        List<RefundResponseDTO> response = refundService.getRefundsByBookingId(bookingId);
        return ResponseEntity.ok(ApiResponse.success("ดึงรายการประวัติการคืนเงินสำเร็จ", response));
    }
}
