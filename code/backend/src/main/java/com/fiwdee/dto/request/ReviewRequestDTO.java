package com.fiwdee.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Customer feedback submitted for a completed booking. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewRequestDTO {

    @NotNull(message = "Overall rating is required")
    @Min(value = 1, message = "Overall rating must be between 1 and 5")
    @Max(value = 5, message = "Overall rating must be between 1 and 5")
    private Integer overallRating;

    @NotNull(message = "Therapist rating is required")
    @Min(value = 1, message = "Therapist rating must be between 1 and 5")
    @Max(value = 5, message = "Therapist rating must be between 1 and 5")
    private Integer therapistRating;

    @NotNull(message = "Cleanliness rating is required")
    @Min(value = 1, message = "Cleanliness rating must be between 1 and 5")
    @Max(value = 5, message = "Cleanliness rating must be between 1 and 5")
    private Integer cleanlinessRating;

    @Size(max = 2000, message = "Review comment must not exceed 2,000 characters")
    private String comment;
}
