package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Review;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** UT26 – ReviewServiceImpl.submitReview: เงื่อนไขอื่น (Weak Robust EC) */
@DisplayName("UT26 submitReview – EC")
class UT26_ReviewTest extends ReviewTestBase {

    @Test
    @DisplayName("UT26-TC001 (V1) booking COMPLETED ยังไม่มีรีวิว → บันทึก และ booking.review ถูกตั้งค่า")
    void tc001() {
        Booking b = completedBooking(10, t5, BookingStatus.COMPLETED);
        Review saved = reviewService.submitReview(10L, 4, 4, 4, "นวดดีมาก");
        assertThat(saved.getBooking()).isSameAs(b);
        assertThat(b.getReview()).isSameAs(saved);
        assertThat(saved.getComment()).isEqualTo("นวดดีมาก");
    }

    @Test
    @DisplayName("UT26-TC002 (V2) comment มีช่องว่างหน้า/หลัง → trim")
    void tc002() {
        completedBooking(10, t5, BookingStatus.COMPLETED);
        assertThat(reviewService.submitReview(10L, 4, 4, 4, "  นวดดีมาก  ").getComment()).isEqualTo("นวดดีมาก");
    }

    @Test
    @DisplayName("UT26-TC003 (V3) comment ช่องว่างล้วน → null")
    void tc003() {
        completedBooking(10, t5, BookingStatus.COMPLETED);
        assertThat(reviewService.submitReview(10L, 4, 4, 4, "   ").getComment()).isNull();
    }

    @Test
    @DisplayName("UT26-TC004 (V4) หมอนวดมีรีวิว 5, 4, 4 → averageRating = 4.33")
    void tc004() {
        completedBooking(10, t5, BookingStatus.COMPLETED);
        when(reviewRepository.findAllByBookingTherapistId(5L)).thenReturn(List.of(review(5), review(4), review(4)));

        reviewService.submitReview(10L, 4, 4, 4, null);

        assertThat(t5.getAverageRating()).isEqualByComparingTo(new BigDecimal("4.33"));
    }

    @Test
    @DisplayName("UT26-TC005 (V5) booking ไม่มีหมอนวด → บันทึกสำเร็จ ไม่คำนวณ average")
    void tc005() {
        completedBooking(30, null, BookingStatus.COMPLETED);
        assertThat(reviewService.submitReview(30L, 4, 4, 4, null)).isNotNull();
        verify(reviewRepository, never()).findAllByBookingTherapistId(any());
    }

    @Test
    @DisplayName("UT26-TC006 (I1) ไม่พบ booking → NotFoundException")
    void tc006() {
        when(bookingRepository.findDetailedById(999L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> reviewService.submitReview(999L, 4, 4, 4, null));
    }

    @Test
    @DisplayName("UT26-TC007 (I2) booking ยังไม่ COMPLETED → ValidationException")
    void tc007() {
        completedBooking(10, t5, BookingStatus.CONFIRMED);
        ValidationException ex = assertThrows(ValidationException.class,
                () -> reviewService.submitReview(10L, 4, 4, 4, null));
        assertThat(ex.getMessage()).contains("only be submitted for a completed booking");
        verify(reviewRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("UT26-TC008 (I3) รีวิวซ้ำ → ConflictException")
    void tc008() {
        completedBooking(10, t5, BookingStatus.COMPLETED);
        when(reviewRepository.existsByBookingId(10L)).thenReturn(true);
        assertThrows(ConflictException.class, () -> reviewService.submitReview(10L, 4, 4, 4, null));
        verify(reviewRepository, never()).saveAndFlush(any());
    }

    @Test
    @DisplayName("UT26-TC009 (I4) overallRating = null → ValidationException")
    void tc009() {
        completedBooking(10, t5, BookingStatus.COMPLETED);
        assertThrows(ValidationException.class, () -> reviewService.submitReview(10L, null, 4, 4, null));
    }

}
