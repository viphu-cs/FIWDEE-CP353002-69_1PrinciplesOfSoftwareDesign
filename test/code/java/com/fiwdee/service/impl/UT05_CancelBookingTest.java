package com.fiwdee.service.impl;

import static com.fiwdee.testsupport.TestData.NOW;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mockStatic;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.dto.request.CancelBookingRequestDTO;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.testsupport.TestData;
import java.time.LocalDateTime;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.http.HttpStatus;

/**
 * UT05 – BookingServiceImpl.cancelBooking (Decision Table, Extended Entry)
 * now = 2026-11-02 15:00 (mockStatic) • เจ้าของ booking ทุกรายการ = Customer#1
 */
@DisplayName("UT05 cancelBooking – Decision Table")
class UT05_CancelBookingTest extends BookingWorldTestBase {

    private static final LocalDateTime TOMORROW_1500 = LocalDateTime.of(2026, 11, 3, 15, 0);
    private static final LocalDateTime TODAY_1600 = LocalDateTime.of(2026, 11, 2, 16, 0);
    private static final LocalDateTime TODAY_1520 = LocalDateTime.of(2026, 11, 2, 15, 20);
    private static final LocalDateTime TODAY_1430 = LocalDateTime.of(2026, 11, 2, 14, 30);
    private static final LocalDateTime TODAY_1000 = LocalDateTime.of(2026, 11, 2, 10, 0);

    private final User receptionist = TestData.receptionist(50);
    private final User owner = TestData.owner(60);
    private MockedStatic<LocalDateTime> time;

    @BeforeEach
    void freezeTime() {
        time = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
        time.when(LocalDateTime::now).thenReturn(NOW);
    }

    @AfterEach
    void releaseTime() {
        time.close();
    }

    private Booking mine(long id, LocalDateTime start, BookingStatus status) {
        Booking b = TestData.booking(id, c1, t5, r101, s1, o11, start, 60, status);
        bookings.add(b);
        return b;
    }

    private CancelBookingRequestDTO reason(String text) {
        return CancelBookingRequestDTO.builder().reason(text).build();
    }

    @Test
    @DisplayName("UT05-TC001 [R1] currentUser = null → 401")
    void tc001() {
        mine(10, TOMORROW_1500, BookingStatus.CONFIRMED);
        BusinessException ex = assertThrows(BusinessException.class, () -> bookingService.cancelBooking(10L, null, null));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    @DisplayName("UT05-TC002 [R2] ไม่พบ booking → NotFoundException")
    void tc002() {
        assertThrows(NotFoundException.class, () -> bookingService.cancelBooking(999L, null, c1));
    }

    @Test
    @DisplayName("UT05-TC003 [R3] ลูกค้าที่ไม่ใช่เจ้าของ → 403")
    void tc003() {
        Booking b = mine(10, TOMORROW_1500, BookingStatus.CONFIRMED);
        BusinessException ex = assertThrows(BusinessException.class, () -> bookingService.cancelBooking(10L, null, c2));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertNotSaved();
    }

    @Test
    @DisplayName("UT05-TC004 [R4] ลูกค้ายกเลิกเหลือ 1 ชม. → ValidationException")
    void tc004() {
        Booking b = mine(12, TODAY_1600, BookingStatus.CONFIRMED);
        assertThrows(ValidationException.class, () -> bookingService.cancelBooking(12L, null, c1));
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertNotSaved();
    }

    @Test
    @DisplayName("UT05-TC005 [R5] ลูกค้ายกเลิก PENDING ล่วงหน้า 1 วันพร้อมเหตุผล → CANCELLED")
    void tc005() {
        Booking b = mine(13, TOMORROW_1500, BookingStatus.PENDING);
        b.setSpecialNotes(null);

        bookingService.cancelBooking(13L, reason("ติดธุระ"), c1);

        assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(b.getSpecialNotes()).isEqualTo("[Cancelled by CUSTOMER: ติดธุระ]");
        assertThat(savedBooking()).isSameAs(b);
        // DEF-008: ต้อง publish BookingStatusChangedEvent PENDING → CANCELLED 1 ครั้ง
        org.mockito.ArgumentCaptor<Object> event = org.mockito.ArgumentCaptor.forClass(Object.class);
        org.mockito.Mockito.verify(eventPublisher).publishEvent(event.capture());
        assertThat(event.getValue()).isInstanceOfSatisfying(
                com.fiwdee.pattern.observer.BookingStatusChangedEvent.class, e -> {
                    assertThat(e.getBookingId()).isEqualTo(13L);
                    assertThat(e.getOldStatus()).isEqualTo(BookingStatus.PENDING);
                    assertThat(e.getNewStatus()).isEqualTo(BookingStatus.CANCELLED);
                });
    }

    @Test
    @DisplayName("UT05-TC006 [R5] dto = null และมี notes เดิม → ต่อท้ายด้วยเหตุผลเริ่มต้น")
    void tc006() {
        Booking b = mine(20, TOMORROW_1500, BookingStatus.CONFIRMED);
        b.setSpecialNotes("ปวดหลัง");

        bookingService.cancelBooking(20L, null, c1);

        assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(b.getSpecialNotes()).isEqualTo("ปวดหลัง [Cancelled by CUSTOMER: Cancelled by user]");
    }

    @Test
    @Tag("known-defect")
    @DisplayName("UT05-TC007 [R6] ยกเลิกรายการที่จ่ายแล้ว → CANCELLED และคืนเงิน (DEF-007)")
    void tc007() {
        Booking b = mine(14, TOMORROW_1500, BookingStatus.CONFIRMED);
        TestData.payment(514, b, "600.00", PaymentStatus.COMPLETED);

        bookingService.cancelBooking(14L, null, c1);

        assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        // UC-10 A1: ต้องส่งคืนเงินเต็มจำนวนผ่าน RefundService (วิธีแก้ที่แนะนำใน DEF-007)
        org.mockito.Mockito.verify(refundService).processRefund(org.mockito.ArgumentMatchers.argThat(r ->
                Long.valueOf(514L).equals(r.getPaymentId())
                        && r.getRefundAmount().compareTo(new java.math.BigDecimal("600.00")) == 0));
    }

    @Test
    @DisplayName("UT05-TC008 [R7] ลูกค้ายกเลิกรายการที่ CANCELLED แล้ว → ValidationException")
    void tc008() {
        Booking b = mine(18, TOMORROW_1500, BookingStatus.CANCELLED);
        assertThrows(ValidationException.class, () -> bookingService.cancelBooking(18L, null, c1));
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertNotSaved();
    }

    @Test
    @DisplayName("UT05-TC009 [R8] พนักงานยกเลิกเหลือ 1 ชม. → CANCELLED (ไม่ติดกฎ 2 ชม.)")
    void tc009() {
        Booking b = mine(15, TODAY_1600, BookingStatus.CONFIRMED);

        bookingService.cancelBooking(15L, null, receptionist);

        assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
        assertThat(b.getSpecialNotes()).endsWith("[Cancelled by RECEPTIONIST: Cancelled by user]");
    }

    @Test
    @DisplayName("UT05-TC010 [R9] เจ้าของร้านยกเลิก CHECKED_IN → CANCELLED")
    void tc010() {
        Booking b = mine(16, TODAY_1520, BookingStatus.CHECKED_IN);

        bookingService.cancelBooking(16L, null, owner);

        assertThat(b.getStatus()).isEqualTo(BookingStatus.CANCELLED);
    }

    @Test
    @DisplayName("UT05-TC011 [R10] เจ้าของร้านยกเลิก COMPLETED → ValidationException")
    void tc011() {
        Booking b = mine(17, TODAY_1000, BookingStatus.COMPLETED);
        assertThrows(ValidationException.class, () -> bookingService.cancelBooking(17L, null, owner));
        assertThat(b.getStatus()).isEqualTo(BookingStatus.COMPLETED);
        assertNotSaved();
    }

    @Test
    @DisplayName("UT05-TC012 [R10] พนักงานยกเลิก IN_SERVICE → ValidationException")
    void tc012() {
        Booking b = mine(21, TODAY_1430, BookingStatus.IN_SERVICE);
        assertThrows(ValidationException.class, () -> bookingService.cancelBooking(21L, null, receptionist));
        assertThat(b.getStatus()).isEqualTo(BookingStatus.IN_SERVICE);
        assertNotSaved();
    }
}
