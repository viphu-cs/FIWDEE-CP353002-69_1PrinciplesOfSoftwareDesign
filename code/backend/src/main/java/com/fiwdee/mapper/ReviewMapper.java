package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Review;
import com.fiwdee.dto.response.ReviewResponseDTO;
import org.springframework.stereotype.Component;

/** Maps review domain objects at the API boundary. */
@Component
public class ReviewMapper {

    public ReviewResponseDTO toResponseDTO(Review review) {
        if (review == null) {
            return null;
        }
        return ReviewResponseDTO.builder()
            .reviewId(review.getId())
            .bookingId(review.getBooking() == null ? null : review.getBooking().getId())
            .overallRating(review.getOverallRating())
            .therapistRating(review.getTherapistRating())
            .cleanlinessRating(review.getCleanlinessRating())
            .comment(review.getComment())
            .submittedAt(review.getSubmittedAt())
            .therapistName(review.getBooking() == null || review.getBooking().getTherapist() == null
                ? null
                : review.getBooking().getTherapist().getFullName())
            .build();
    }
}
