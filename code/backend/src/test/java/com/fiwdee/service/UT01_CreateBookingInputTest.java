package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.dto.request.BookingRequestDTO;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.testsupport.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.function.Executable;
import org.springframework.http.HttpStatus;

@DisplayName("UT01 createBooking – Input EC")
class UT01_CreateBookingInputTest extends BookingWorldTestBase {

    private final User receptionist = TestData.receptionist(50);

    private void assertRejected(Class<? extends Throwable> type, Executable call) {
        assertThrows(type, call);
        assertNotSaved();
    }

    @Test
    @DisplayName("UT01-TC001 (V1,V3–V6) ลูกค้าจองถูกต้องทั้งหมด → PENDING / ONLINE")
    void tc001() {
        bookingService.createBooking(request(null, 1L, 11L, 5L, null, START), c1);

        Booking b = savedBooking();
        verify(bookingRepository, times(1)).save(any());
        assertThat(b.getStatus()).isEqualTo(BookingStatus.PENDING);
        assertThat(b.getBookingChannel()).isEqualTo("ONLINE");
        assertThat(b.getTotalPrice()).isEqualByComparingTo("600.00");
        assertThat(b.getStartDateTime()).isEqualTo(START);
        assertThat(b.getEndDateTime()).isEqualTo(START.plusMinutes(60));
        assertThat(b.getCustomer().getId()).isEqualTo(1L);
        assertThat(b.getTherapist().getId()).isEqualTo(5L);
        assertThat(b.getRoom().getRoomType()).isEqualTo(RoomType.SINGLE);
        assertThat(b.getBookingReferenceCode()).matches("BK-\\d{8}-[0-9A-F]{6}");
        assertThat(b.getSpecialNotes()).isEqualTo("ปวดสะบักซ้าย");
    }

    @Test
    @DisplayName("UT01-TC002 (V2,V6) พนักงานจองแทน + ไม่ระบุหมอนวด → CONFIRMED / WALK_IN")
    void tc002() {
        bookingService.createBooking(request(1L, 1L, 11L, null, null, START), receptionist);

        Booking b = savedBooking();
        assertThat(b.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(b.getBookingChannel()).isEqualTo("WALK_IN");
        assertThat(b.getCustomer().getId()).isEqualTo(1L);
        assertThat(b.getTherapist()).isNotNull();
        assertThat(b.getTherapist().getSkills()).anyMatch(k -> k.getService().getId().equals(1L));
    }

    @Test
    @DisplayName("UT01-TC003 (I1) currentUser = null → 401")
    void tc003() {
        BusinessException ex = assertThrows(BusinessException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, null, START), null));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertNotSaved();
    }

    @Test
    @DisplayName("UT01-TC004 (I2) ลูกค้าไม่มีโปรไฟล์ Customer → NotFoundException")
    void tc004() {
        Customer ghost = TestData.customer(9);
        assertRejected(NotFoundException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, null, START), ghost));
    }

    @Test
    @DisplayName("UT01-TC005 (I3) พนักงานไม่ระบุ customerId → ValidationException")
    void tc005() {
        assertRejected(ValidationException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 5L, null, START), receptionist));
    }

    @Test
    @DisplayName("UT01-TC006 (I4) พนักงานระบุ customerId ที่ไม่มี → NotFoundException")
    void tc006() {
        assertRejected(NotFoundException.class,
                () -> bookingService.createBooking(request(999L, 1L, 11L, 5L, null, START), receptionist));
    }

    @Test
    @DisplayName("UT01-TC007 (I5) serviceId ไม่มี → NotFoundException")
    void tc007() {
        assertRejected(NotFoundException.class,
                () -> bookingService.createBooking(request(null, 999L, 11L, 5L, null, START), c1));
    }

    @Test
    @DisplayName("UT01-TC008 (I6) service inactive → ValidationException")
    void tc008() {
        assertRejected(ValidationException.class,
                () -> bookingService.createBooking(request(null, 3L, 31L, 5L, null, START), c1));
    }

    @Test
    @DisplayName("UT01-TC009 (I7) durationOptionId ไม่มี → NotFoundException")
    void tc009() {
        assertRejected(NotFoundException.class,
                () -> bookingService.createBooking(request(null, 1L, 999L, 5L, null, START), c1));
    }

    @Test
    @DisplayName("UT01-TC010 (I8) durationOption เป็นของ service อื่น → ValidationException")
    void tc010() {
        assertRejected(ValidationException.class,
                () -> bookingService.createBooking(request(null, 1L, 21L, 5L, null, START), c1));
    }

    @Test
    @DisplayName("UT01-TC011 (I9) durationOption inactive → ValidationException")
    void tc011() {
        assertRejected(ValidationException.class,
                () -> bookingService.createBooking(request(null, 1L, 12L, 5L, null, START), c1));
    }

    @Test
    @DisplayName("UT01-TC012 (I10) startDateTime = null → ValidationException")
    void tc012() {
        BookingRequestDTO req = request(null, 1L, 11L, 5L, null, null);
        assertRejected(ValidationException.class, () -> bookingService.createBooking(req, c1));
    }

    @Test
    @DisplayName("UT01-TC013 (I11) therapistId ไม่มี → NotFoundException")
    void tc013() {
        assertRejected(NotFoundException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 999L, null, START), c1));
    }

    @Test
    @DisplayName("UT01-TC014 (I12) หมอนวด inactive → ValidationException")
    void tc014() {
        assertRejected(ValidationException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 7L, null, START), c1));
    }

    @Test
    @DisplayName("UT01-TC015 (I13) หมอนวดไม่มีทักษะ → ValidationException")
    void tc015() {
        assertRejected(ValidationException.class,
                () -> bookingService.createBooking(request(null, 1L, 11L, 6L, null, START), c1));
    }
}
