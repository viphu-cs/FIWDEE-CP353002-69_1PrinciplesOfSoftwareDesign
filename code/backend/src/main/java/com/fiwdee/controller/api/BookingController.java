package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.domain.entity.User;
import com.fiwdee.dto.response.MyBookingResponseDTO;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.service.BookingService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Customer-facing booking endpoints. Creation/availability live here later
 * (TASKS 2.3–2.4); for now it exposes the authenticated user's own history.
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<MyBookingResponseDTO>>> myBookings(
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required. Please provide a valid Bearer token",
                    HttpStatus.UNAUTHORIZED);
        }
        List<MyBookingResponseDTO> bookings = bookingService.getMyBookings(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("ดึงประวัติการจองสำเร็จ", bookings));
    }
}
