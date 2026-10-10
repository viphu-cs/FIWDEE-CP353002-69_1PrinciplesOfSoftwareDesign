package com.fiwdee.service.impl;

import static com.fiwdee.testsupport.TestData.DAY;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ConflictException;
import java.time.LocalDateTime;
import java.time.LocalTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;

/**
 * UT04 – เวลาทับซ้อนของห้อง (buffer 15 นาที) และหมอนวด (buffer 0) – Robustness BVA ขอบด้านเดียว
 * Booking เดิม E1: R101 + T1, 09/11 13:00–14:00 CONFIRMED • คำขอใหม่ 60 นาที
 * ROOM: roomId 101 + therapist T2 (ว่าง) • THERAPIST: therapist T1 + roomId 102 (ว่าง)
 */
@DisplayName("UT04 Overlap & cleaning buffer – Robustness BVA")
class UT04_OverlapBufferTest extends BookingWorldTestBase {

    @org.junit.jupiter.api.BeforeEach
    void freezeNow() {
        freezeClock();
    }

    @org.junit.jupiter.api.AfterEach
    void releaseNow() {
        releaseClock();
    }

    @BeforeEach
    void existingBookingE1() {
        existing(500, t1, r101, DAY.atTime(13, 0), 60, BookingStatus.CONFIRMED);
    }

    @ParameterizedTest(name = "{0} [{1}] start {2} → available={3}")
    @CsvSource({
        "UT04-TC001, BOTH,      16:00, true",
        "UT04-TC002, ROOM,      14:14, false",
        "UT04-TC003, ROOM,      14:15, true",
        "UT04-TC004, ROOM,      14:16, true",
        "UT04-TC005, ROOM,      11:46, false",
        "UT04-TC006, ROOM,      11:45, true",
        "UT04-TC007, ROOM,      11:44, true",
        "UT04-TC008, THERAPIST, 13:59, false",
        "UT04-TC009, THERAPIST, 14:00, true",
        "UT04-TC010, THERAPIST, 14:01, true",
        "UT04-TC011, THERAPIST, 12:01, false",
        "UT04-TC012, THERAPIST, 12:00, true",
        "UT04-TC013, THERAPIST, 11:59, true"
    })
    void overlapBoundary(String tc, String resource, LocalTime time, boolean available) {
        final long therapistId = "ROOM".equals(resource) ? 2L : 1L;
        final long roomId = "THERAPIST".equals(resource) ? 102L : 101L;
        final LocalDateTime start = DAY.atTime(time);

        if (available) {
            bookingService.createBooking(request(null, 1L, 11L, therapistId, roomId, start), c1);
            Booking b = savedBooking();
            assertThat(b.getRoom().getId()).isEqualTo(roomId);
            assertThat(b.getTherapist().getId()).isEqualTo(therapistId);
        } else {
            assertThrows(ConflictException.class,
                    () -> bookingService.createBooking(request(null, 1L, 11L, therapistId, roomId, start), c1),
                    tc + " ต้องชน (" + resource + ")");
            assertNotSaved();
        }
    }

    @Test
    @DisplayName("UT04 (ระดับ unit) query ห้องต้องได้ช่วงเวลาที่ขยาย buffer 15 นาทีทั้งสองฝั่ง")
    void roomQueryUsesBufferedWindow() {
        LocalDateTime start = DAY.atTime(16, 0);
        bookingService.createBooking(request(null, 1L, 11L, 2L, 101L, start), c1);

        ArgumentCaptor<LocalDateTime> from = ArgumentCaptor.forClass(LocalDateTime.class);
        ArgumentCaptor<LocalDateTime> to = ArgumentCaptor.forClass(LocalDateTime.class);
        verify(bookingRepository, atLeastOnce()).findConflictingRoomBookings(eq(101L), from.capture(), to.capture(), any());
        assertThat(from.getValue()).isEqualTo(start.minusMinutes(15));
        assertThat(to.getValue()).isEqualTo(start.plusMinutes(60 + 15));
    }
}
