package com.fiwdee.service;

import static com.fiwdee.testsupport.TestData.DAY;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.testsupport.TestData;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

/** UT07 – BookingServiceImpl.getBookingById: สิทธิ์การดู (Decision Table, Limited Entry) */
@DisplayName("UT07 getBookingById – Access Decision Table")
class UT07_GetBookingByIdTest extends BookingWorldTestBase {

    private Booking b10;
    private Booking b30;

    @BeforeEach
    void bookings() {
        b10 = TestData.booking(10, c1, t5, r101, s1, o11, DAY.atTime(15, 30), 60, BookingStatus.CONFIRMED);
        b30 = TestData.booking(30, c1, null, r101, s1, o11, DAY.atTime(17, 0), 60, BookingStatus.PENDING);
        bookings.add(b10);
        bookings.add(b30);
    }

    private void assertForbidden(long id, User user) {
        BusinessException ex = assertThrows(BusinessException.class, () -> bookingService.getBookingById(id, user));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    @DisplayName("UT07-TC001 [R1] currentUser = null → 401")
    void tc001() {
        BusinessException ex = assertThrows(BusinessException.class, () -> bookingService.getBookingById(10L, null));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("UT07-TC002 [R2] ไม่พบ booking → NotFoundException")
    void tc002() {
        assertThrows(NotFoundException.class, () -> bookingService.getBookingById(999L, c1));
    }

    @Test
    @DisplayName("UT07-TC003 [R3] ลูกค้าเจ้าของ → ได้ข้อมูล")
    void tc003() {
        assertThatCode(() -> bookingService.getBookingById(10L, c1)).doesNotThrowAnyException();
        verify(bookingMapper).toBookingResponse(b10);
    }

    @Test
    @DisplayName("UT07-TC004 [R4] ลูกค้าคนอื่น → 403")
    void tc004() {
        assertForbidden(10L, c2);
    }

    @Test
    @DisplayName("UT07-TC005 [R5] หมอนวดที่ได้รับมอบหมาย → ได้ข้อมูล")
    void tc005() {
        assertThatCode(() -> bookingService.getBookingById(10L, t5)).doesNotThrowAnyException();
        verify(bookingMapper).toBookingResponse(b10);
    }

    @Test
    @DisplayName("UT07-TC006 [R6] หมอนวดคนอื่น → 403")
    void tc006() {
        assertForbidden(10L, t8);
    }

    @Test
    @DisplayName("UT07-TC007 [R6] booking ยังไม่มีหมอนวด → 403 ไม่เกิด NullPointerException")
    void tc007() {
        assertForbidden(30L, t5);
    }

    @Test
    @DisplayName("UT07-TC008 [R7] พนักงานต้อนรับ → ได้ข้อมูล")
    void tc008() {
        assertThatCode(() -> bookingService.getBookingById(10L, TestData.receptionist(50))).doesNotThrowAnyException();
        verify(bookingMapper).toBookingResponse(b10);
    }
}
