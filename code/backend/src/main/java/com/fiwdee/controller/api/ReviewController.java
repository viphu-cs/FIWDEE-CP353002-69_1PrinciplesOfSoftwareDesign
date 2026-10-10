package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.domain.entity.Review;
import com.fiwdee.dto.request.ReviewRequestDTO;
import com.fiwdee.dto.response.ReviewResponseDTO;
import com.fiwdee.mapper.ReviewMapper;
import com.fiwdee.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

/** Customer feedback endpoint for completed services. */
@Tag(name = "Reviews", description = "ระบบรีวิวการให้บริการ (สำหรับรายการที่เสร็จสิ้น COMPLETED)")
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final ReviewMapper reviewMapper;

    @PostMapping("/{bookingId}/review")
    public ResponseEntity<ApiResponse<ReviewResponseDTO>> submitReview(
        @PathVariable Long bookingId,
        @Valid @RequestBody ReviewRequestDTO request
    ) {
        Review review = reviewService.submitReview(
            bookingId,
            request.getOverallRating(),
            request.getTherapistRating(),
            request.getCleanlinessRating(),
            request.getComment()
        );
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Review submitted", reviewMapper.toResponseDTO(review)));
    }
}
