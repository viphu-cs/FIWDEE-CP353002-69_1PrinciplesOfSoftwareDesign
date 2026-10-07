package com.fiwdee.service;

import com.fiwdee.domain.entity.Review;

/** Application boundary for customer service feedback. */
public interface ReviewService {

    Review submitReview(
        Long bookingId,
        Integer overallRating,
        Integer therapistRating,
        Integer cleanlinessRating,
        String comment
    );
}
