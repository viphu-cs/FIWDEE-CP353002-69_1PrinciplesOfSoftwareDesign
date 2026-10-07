package com.fiwdee.dto.response;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

/** Safely exposes persisted review details without returning the JPA entity. */
@Getter
@Builder
public class ReviewResponseDTO {

    private final Long reviewId;
    private final Long bookingId;
    private final Integer overallRating;
    private final Integer therapistRating;
    private final Integer cleanlinessRating;
    private final String comment;
    private final LocalDateTime submittedAt;
    private final String therapistName;
}
