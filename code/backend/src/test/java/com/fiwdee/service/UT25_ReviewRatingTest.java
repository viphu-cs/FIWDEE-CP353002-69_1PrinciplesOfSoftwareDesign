package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.fiwdee.domain.entity.Review;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ValidationException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * UT25 – ReviewServiceImpl.submitReview: คะแนน 3 ด้าน (Robustness BVA, 6n+1 = 19 เคส)
 * ค่า nom = 3 • ค่าที่ทดสอบ 0, 1, 2, 4, 5, 6 ทีละตัวแปร
 */
@DisplayName("UT25 submitReview – rating robustness BVA")
class UT25_ReviewRatingTest extends ReviewTestBase {

    /** errorField ว่าง = ต้องบันทึกสำเร็จ */
    @ParameterizedTest(name = "{0}: overall={1}, therapist={2}, cleanliness={3} → {4}")
    @CsvSource({
        "UT25-TC001, 3, 3, 3, ''",
        "UT25-TC002, 0, 3, 3, Overall",
        "UT25-TC003, 1, 3, 3, ''",
        "UT25-TC004, 2, 3, 3, ''",
        "UT25-TC005, 4, 3, 3, ''",
        "UT25-TC006, 5, 3, 3, ''",
        "UT25-TC007, 6, 3, 3, Overall",
        "UT25-TC008, 3, 0, 3, Therapist",
        "UT25-TC009, 3, 1, 3, ''",
        "UT25-TC010, 3, 2, 3, ''",
        "UT25-TC011, 3, 4, 3, ''",
        "UT25-TC012, 3, 5, 3, ''",
        "UT25-TC013, 3, 6, 3, Therapist",
        "UT25-TC014, 3, 3, 0, Cleanliness",
        "UT25-TC015, 3, 3, 1, ''",
        "UT25-TC016, 3, 3, 2, ''",
        "UT25-TC017, 3, 3, 4, ''",
        "UT25-TC018, 3, 3, 5, ''",
        "UT25-TC019, 3, 3, 6, Cleanliness"
    })
    void rating(String tc, int overall, int therapist, int cleanliness, String errorField) {
        completedBooking(10, t5, BookingStatus.COMPLETED);

        if (errorField.isEmpty()) {
            Review saved = reviewService.submitReview(10L, overall, therapist, cleanliness, "ดี");
            verify(reviewRepository, times(1)).saveAndFlush(any(Review.class));
            assertThat(saved.getOverallRating()).isEqualTo(overall);
            assertThat(saved.getTherapistRating()).isEqualTo(therapist);
            assertThat(saved.getCleanlinessRating()).isEqualTo(cleanliness);
        } else {
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> reviewService.submitReview(10L, overall, therapist, cleanliness, "ดี"), tc);
            assertThat(ex.getMessage()).isEqualTo(errorField + " rating must be between 1 and 5");
            verify(reviewRepository, never()).saveAndFlush(any());
        }
    }
}
