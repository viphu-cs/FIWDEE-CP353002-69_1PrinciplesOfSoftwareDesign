package com.fiwdee.service.impl;

import static com.fiwdee.testsupport.TestData.DAY;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.ValidationException;
import java.time.LocalTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * UT02 – createBooking: จัดสรรหมอนวดและห้อง (Decision Table, Limited Entry)
 * ผู้มีทักษะ S1 ในชีตนี้มีแค่ T5, T8 • คิวที่ใช้กันหมอนวดวางในห้อง R201 (COUPLE) เพื่อไม่กระทบห้อง SINGLE
 */
@DisplayName("UT02 createBooking – Resource allocation Decision Table")
class UT02_CreateBookingResourceTest extends BookingWorldTestBase {

    @org.junit.jupiter.api.BeforeEach
    void freezeNow() {
        freezeClock();
    }

    @org.junit.jupiter.api.AfterEach
    void releaseNow() {
        releaseClock();
    }

    @BeforeEach
    void onlyT5AndT8() {
        onlyQualified(s1, 5L, 8L);
    }

    @Test
    @DisplayName("UT02-TC001 [R1] ระบุ T5 ที่หยุดวันนั้น → ConflictException")
    void tc001() {
        dayOff(t5, DAY);
        assertThrows(ConflictException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, null, START), c1));
        assertNotSaved();
    }

    @Test
    @Tag("known-defect")
    @DisplayName("UT02-TC002 [R1] ระบุ T5 แต่จองนอกกะ 10:00–14:00 → ConflictException (DEF-005)")
    void tc002() {
        shift(t5, DAY, LocalTime.of(10, 0), LocalTime.of(14, 0));
        assertThrows(ConflictException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, null, START), c1));
        assertNotSaved();
    }

    @Test
    @DisplayName("UT02-TC003 [R2] ระบุ T5 ที่มีคิวทับ → ConflictException")
    void tc003() {
        existing(500, t5, r201, DAY.atTime(15, 0), 60, BookingStatus.CONFIRMED);
        assertThrows(ConflictException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, null, START), c1));
        assertNotSaved();
    }

    @Test
    @DisplayName("UT02-TC004 [R3] ไม่ระบุหมอนวด และไม่มีใครว่าง → ConflictException")
    void tc004() {
        dayOff(t5, DAY);
        existing(500, t8, r201, DAY.atTime(15, 0), 60, BookingStatus.CONFIRMED);
        assertThrows(ConflictException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, null, null, START), c1));
        assertNotSaved();
    }

    @Test
    @DisplayName("UT02-TC005 [R4] ระบุห้อง COUPLE กับบริการ SINGLE → ValidationException")
    void tc005() {
        assertThrows(ValidationException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, 201L, START), c1));
        assertNotSaved();
    }

    @Test
    @DisplayName("UT02-TC006 [R4] ระบุห้องที่ปิดใช้งาน → ValidationException")
    void tc006() {
        assertThrows(ValidationException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, 103L, START), c1));
        assertNotSaved();
    }

    @Test
    @DisplayName("UT02-TC007 [R5] ระบุ R101 ที่มีคิว 14:00–15:20 (ติด buffer) → ConflictException")
    void tc007() {
        existing(500, t1, r101, DAY.atTime(14, 0), 80, BookingStatus.CONFIRMED);
        assertThrows(ConflictException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, 101L, START), c1));
        assertNotSaved();
    }

    @Test
    @DisplayName("UT02-TC008 [R6] ระบุ T5 + R102 ที่ว่างทั้งคู่ → สำเร็จ")
    void tc008() {
        bookingService.createBooking(request(null, 1L, 11L, 5L, 102L, START), c1);
        Booking b = savedBooking();
        assertThat(b.getTherapist().getId()).isEqualTo(5L);
        assertThat(b.getRoom().getId()).isEqualTo(102L);
    }

    @Test
    @DisplayName("UT02-TC009 [R7] ไม่ระบุทั้งคู่ หมอนวดว่างแต่ห้อง SINGLE เต็ม → ConflictException")
    void tc009() {
        existing(500, t1, r101, DAY.atTime(15, 0), 60, BookingStatus.CONFIRMED);
        existing(501, t2, r102, DAY.atTime(15, 0), 60, BookingStatus.CONFIRMED);
        assertThrows(ConflictException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, null, null, START), c1));
        assertNotSaved();
    }

    @Test
    @DisplayName("UT02-TC010 [R8] ไม่ระบุทั้งคู่ → ได้ T8 (ข้ามคนหยุด) + R102 (ข้ามห้องไม่ว่างและห้อง COUPLE)")
    void tc010() {
        dayOff(t5, DAY);
        existing(500, t1, r101, DAY.atTime(15, 0), 60, BookingStatus.CONFIRMED);

        bookingService.createBooking(request(null, 1L, 11L, null, null, START), c1);

        Booking b = savedBooking();
        assertThat(b.getTherapist().getId()).isEqualTo(8L);
        assertThat(b.getRoom().getId()).isEqualTo(102L);
    }
}
