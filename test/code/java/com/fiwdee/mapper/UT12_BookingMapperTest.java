package com.fiwdee.mapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.dto.response.BookingResponseDTO;
import com.fiwdee.dto.response.MyBookingResponseDTO;
import com.fiwdee.testsupport.TestData;
import java.time.LocalDateTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** UT12 – BookingMapper (Weak Normal EC: relation มี / null) */
@DisplayName("UT12 BookingMapper – Weak Normal EC")
class UT12_BookingMapperTest {

    private static final LocalDateTime START = LocalDateTime.of(2026, 11, 9, 15, 30);
    private final BookingMapper mapper = new BookingMapper();

    private Booking full() {
        Customer c = TestData.customer(1);
        Service s = TestData.service(1, "นวดไทยราชสำนัก", true);
        ServiceDurationOption o = TestData.option(11, s, 60, "600.00", true);
        Therapist t = TestData.therapist(5, "มะลิ", true);
        Room r = TestData.room(101, "R101", RoomType.SINGLE, true);
        Booking b = TestData.booking(10, c, t, r, s, o, START, 60, BookingStatus.CONFIRMED);
        b.setSpecialNotes("ปวดหลัง");
        b.setCreatedAt(START.minusDays(3));
        return b;
    }

    @Test
    @DisplayName("UT12-TC001 (V1) toBookingResponse ครบทุก relation")
    void tc001() {
        BookingResponseDTO dto = mapper.toBookingResponse(full());

        assertThat(dto.getId()).isEqualTo(10L);
        assertThat(dto.getCustomerId()).isEqualTo(1L);
        assertThat(dto.getCustomerName()).isEqualTo("ลูกค้า 1");
        assertThat(dto.getCustomerPhone()).isNotBlank();
        assertThat(dto.getServiceId()).isEqualTo(1L);
        assertThat(dto.getServiceName()).isEqualTo("นวดไทยราชสำนัก");
        assertThat(dto.getDurationOptionId()).isEqualTo(11L);
        assertThat(dto.getDurationMinutes()).isEqualTo(60);
        assertThat(dto.getTherapistId()).isEqualTo(5L);
        assertThat(dto.getTherapistName()).isEqualTo("มะลิ");
        assertThat(dto.getRoomId()).isEqualTo(101L);
        assertThat(dto.getRoomNumber()).isEqualTo("R101");
        assertThat(dto.getRoomType()).isEqualTo("SINGLE");
        assertThat(dto.getStatus()).isEqualTo(BookingStatus.CONFIRMED);
        assertThat(dto.getBookingChannel()).isEqualTo("ONLINE");
        assertThat(dto.getSpecialNotes()).isEqualTo("ปวดหลัง");
        assertThat(dto.getTotalPrice()).isEqualByComparingTo("600.00");
    }

    @Test
    @DisplayName("UT12-TC002 (V1) toMyBookingResponse ครบทุก relation")
    void tc002() {
        MyBookingResponseDTO dto = mapper.toMyBookingResponse(full());

        assertThat(dto.getServiceName()).isEqualTo("นวดไทยราชสำนัก");
        assertThat(dto.getTherapistName()).isEqualTo("มะลิ");
        assertThat(dto.getRoomNumber()).isEqualTo("R101");
        assertThat(dto.getDurationMinutes()).isEqualTo(60);
        assertThat(dto.getStatus()).isEqualTo("CONFIRMED");
        assertThat(dto.getStartDateTime()).isEqualTo(START);
        assertThat(dto.getCreatedAt()).isEqualTo(START.minusDays(3));
    }

    @Test
    @DisplayName("UT12-TC003 (V2) therapist = null")
    void tc003() {
        Booking b = full();
        b.setTherapist(null);
        BookingResponseDTO dto = mapper.toBookingResponse(b);
        assertThat(dto.getTherapistId()).isNull();
        assertThat(dto.getTherapistName()).isNull();
        assertThat(dto.getServiceName()).isEqualTo("นวดไทยราชสำนัก");
    }

    @Test
    @DisplayName("UT12-TC004 (V3) service/room/option/customer = null")
    void tc004() {
        Booking b = full();
        b.setService(null);
        b.setRoom(null);
        b.setDurationOption(null);
        b.setCustomer(null);

        assertThatCode(() -> mapper.toBookingResponse(b)).doesNotThrowAnyException();
        BookingResponseDTO dto = mapper.toBookingResponse(b);
        assertThat(dto.getServiceId()).isNull();
        assertThat(dto.getRoomNumber()).isNull();
        assertThat(dto.getDurationMinutes()).isNull();
        assertThat(dto.getCustomerName()).isNull();
    }

    @Test
    @DisplayName("UT12-TC005 (V4) status = null")
    void tc005() {
        Booking b = full();
        b.setStatus(null);
        assertThat(mapper.toMyBookingResponse(b).getStatus()).isNull();
    }

    @Test
    @DisplayName("UT12-TC006 (V5) room.roomType = null")
    void tc006() {
        Booking b = full();
        b.getRoom().setRoomType(null);
        BookingResponseDTO dto = mapper.toBookingResponse(b);
        assertThat(dto.getRoomNumber()).isEqualTo("R101");
        assertThat(dto.getRoomType()).isNull();
    }

    @Test
    @DisplayName("UT12-TC007 (V6) booking = null → null")
    void tc007() {
        assertThat(mapper.toBookingResponse(null)).isNull();
        assertThat(mapper.toMyBookingResponse(null)).isNull();
    }

    @Test
    @DisplayName("UT12-TC008 (V7) List = null หรือว่าง → List ว่าง")
    void tc008() {
        assertThat(mapper.toBookingResponses(null)).isEmpty();
        assertThat(mapper.toMyBookingResponses(null)).isEmpty();
        assertThat(mapper.toBookingResponses(List.of())).isEmpty();
        assertThat(mapper.toMyBookingResponses(List.of())).isEmpty();
    }
}
