package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.dto.request.BookingRequestDTO;
import com.fiwdee.dto.request.CancelBookingRequestDTO;
import com.fiwdee.dto.response.AvailabilityResponseDTO;
import com.fiwdee.dto.response.BookingResponseDTO;
import com.fiwdee.dto.response.MyBookingResponseDTO;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.service.AvailabilityService;
import com.fiwdee.service.BookingService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing booking availability, customer lifecycle actions, and back-office bookings.
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final AvailabilityService availabilityService;

    /**
     * Checks available time slots, therapists, and rooms for a service on a given date (UC-08).
     */
    @GetMapping("/bookings/availability")
    public ResponseEntity<ApiResponse<AvailabilityResponseDTO>> checkAvailability(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam Long serviceId,
            @RequestParam(required = false) Integer durationMinutes) {
        AvailabilityResponseDTO response = availabilityService.checkAvailability(date, serviceId, durationMinutes);
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลช่วงเวลาว่างสำเร็จ", response));
    }

    /**
     * Creates a new booking (UC-07).
     */
    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO requestDTO,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required. Please provide a valid Bearer token",
                    HttpStatus.UNAUTHORIZED);
        }
        BookingResponseDTO created = bookingService.createBooking(requestDTO, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("สร้างการจองบริการสำเร็จ", created));
    }

    /**
     * Retrieves the authenticated customer's own booking history.
     */
    @GetMapping("/bookings/my")
    public ResponseEntity<ApiResponse<List<MyBookingResponseDTO>>> myBookings(
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required. Please provide a valid Bearer token",
                    HttpStatus.UNAUTHORIZED);
        }
        List<MyBookingResponseDTO> bookings = bookingService.getMyBookings(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("ดึงประวัติการจองสำเร็จ", bookings));
    }

    /**
     * Retrieves a single booking detail by ID (UC-09).
     */
    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required. Please provide a valid Bearer token",
                    HttpStatus.UNAUTHORIZED);
        }
        BookingResponseDTO booking = bookingService.getBookingById(id, currentUser);
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลการจองสำเร็จ", booking));
    }

    /**
     * Cancels a booking via the State Pattern (UC-10).
     */
    @PatchMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancelBooking(
            @PathVariable Long id,
            @RequestBody(required = false) CancelBookingRequestDTO dto,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required. Please provide a valid Bearer token",
                    HttpStatus.UNAUTHORIZED);
        }
        BookingResponseDTO cancelled = bookingService.cancelBooking(id, dto, currentUser);
        return ResponseEntity.ok(ApiResponse.success("ยกเลิกการจองสำเร็จ", cancelled));
    }

    /**
     * Updates booking status via the State Pattern.
     */
    @PatchMapping("/bookings/{id}/status")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> updateStatus(
            @PathVariable Long id,
            @RequestParam BookingStatus status,
            @AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required. Please provide a valid Bearer token",
                    HttpStatus.UNAUTHORIZED);
        }
        BookingResponseDTO updated = bookingService.updateBookingStatus(id, status, currentUser);
        return ResponseEntity.ok(ApiResponse.success("อัปเดตสถานะการจองสำเร็จ", updated));
    }

    /**
     * Retrieves bookings for a specific date for staff/admin overview (UC-09).
     */
    @GetMapping("/admin/bookings")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getAdminBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<BookingResponseDTO> bookings = bookingService.getAdminBookings(date);
        return ResponseEntity.ok(ApiResponse.success("ดึงรายการจองสำหรับผู้ดูแลสำเร็จ", bookings));
    }
}
