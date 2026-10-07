package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.response.QueueItemResponseDTO;
import com.fiwdee.mapper.QueueMapper;
import com.fiwdee.service.QueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Front-desk booking arrival operations. */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class FrontDeskController {

    private final QueueService queueService;
    private final QueueMapper queueMapper;

    @PatchMapping("/{bookingId}/check-in")
    public ResponseEntity<ApiResponse<QueueItemResponseDTO>> checkIn(@PathVariable Long bookingId) {
        return ResponseEntity.ok(
            ApiResponse.success("Customer checked in", queueMapper.toResponseDTO(queueService.checkInBooking(bookingId)))
        );
    }
}
