package com.fiwdee.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.fiwdee.service.impl.ReviewServiceImpl;
import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Review;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.ReviewRepository;
import com.fiwdee.testsupport.TestData;
import java.util.Optional;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/** ฐานร่วม UT25–UT26 สำหรับ ReviewServiceImpl */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
abstract class ReviewTestBase {

    @Mock ReviewRepository reviewRepository;
    @Mock BookingRepository bookingRepository;
    @InjectMocks ReviewServiceImpl reviewService;

    Therapist t5 = TestData.therapist(5, "มะลิ", true);

    /** booking ที่ repository คืนให้ และยังไม่มีรีวิว (existsByBookingId = false โดยค่าเริ่มต้นของ mock) */
    Booking completedBooking(long id, Therapist therapist, BookingStatus status) {
        Booking b = TestData.booking(id, TestData.customer(1), therapist, null, null, null,
                TestData.DAY.atTime(13, 0), 60, status);
        when(bookingRepository.findDetailedById(id)).thenReturn(Optional.of(b));
        when(reviewRepository.saveAndFlush(any(Review.class))).thenAnswer(i -> {
            Review r = i.getArgument(0);
            r.setId(100L);
            return r;
        });
        return b;
    }

    static Review review(int therapistRating) {
        Review r = new Review();
        r.setOverallRating(4);
        r.setTherapistRating(therapistRating);
        r.setCleanlinessRating(4);
        return r;
    }
}
