package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Review;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.ReviewRepository;
import com.fiwdee.service.ReviewService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Persists one validated review per completed booking and refreshes therapist feedback. */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public Review submitReview(
        Long bookingId,
        Integer overallRating,
        Integer therapistRating,
        Integer cleanlinessRating,
        String comment
    ) {
        validateRating("Overall rating", overallRating);
        validateRating("Therapist rating", therapistRating);
        validateRating("Cleanliness rating", cleanlinessRating);

        Booking booking = bookingRepository.findDetailedById(bookingId)
            .orElseThrow(() -> new NotFoundException("Booking " + bookingId + " was not found"));
        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new ValidationException("A review can only be submitted for a completed booking");
        }
        if (reviewRepository.existsByBookingId(bookingId)) {
            throw new ConflictException("A review has already been submitted for booking " + bookingId);
        }

        Review review = Review.builder()
            .booking(booking)
            .overallRating(overallRating)
            .therapistRating(therapistRating)
            .cleanlinessRating(cleanlinessRating)
            .comment(normalizeComment(comment))
            .build();
        Review savedReview = reviewRepository.saveAndFlush(review);
        booking.setReview(savedReview);
        refreshTherapistAverageRating(booking.getTherapist());
        return savedReview;
    }

    private void refreshTherapistAverageRating(Therapist therapist) {
        if (therapist == null || therapist.getId() == null) {
            return;
        }
        List<Review> reviews = reviewRepository.findAllByBookingTherapistId(therapist.getId());
        if (reviews.isEmpty()) {
            return;
        }
        BigDecimal average = reviews.stream()
            .map(Review::getTherapistRating)
            .map(BigDecimal::valueOf)
            .reduce(BigDecimal.ZERO, BigDecimal::add)
            .divide(BigDecimal.valueOf(reviews.size()), 2, RoundingMode.HALF_UP);
        therapist.setAverageRating(average);
    }

    private void validateRating(String fieldName, Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new ValidationException(fieldName + " must be between 1 and 5");
        }
    }

    private String normalizeComment(String comment) {
        if (comment == null || comment.isBlank()) {
            return null;
        }
        return comment.trim();
    }
}
