package com.fiwdee.service;

import static com.fiwdee.testsupport.TestData.DAY;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.DayOfWeek;
import com.fiwdee.dto.response.AvailabilityResponseDTO;
import com.fiwdee.dto.response.AvailabilityResponseDTO.TimeSlotDTO;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import java.time.LocalDate;
import java.time.LocalTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/** UT11 – AvailabilityServiceImpl.checkAvailability: สภาพร้านและทรัพยากร (Weak Robust EC) */
@DisplayName("UT11 checkAvailability – Weak Robust EC")
class UT11_AvailabilityConditionTest extends BookingWorldTestBase {

    @BeforeEach
    void oneRoom() {
        rooms.removeIf(r -> r != r101);
        onlyQualified(s1, 5L);
    }

    private TimeSlotDTO slot(AvailabilityResponseDTO res, int hour) {
        return res.getAvailableSlots().stream()
                .filter(s -> s.getStartTime().equals(LocalTime.of(hour, 0)))
                .findFirst().orElseThrow();
    }

    @Test
    @DisplayName("UT11-TC001 (V1,V3,V4) ร้านเปิด ทรัพยากรว่าง → 12 รอบ available ทั้งหมด")
    void tc001() {
        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, 60);

        assertThat(res.getAvailableSlots()).hasSize(12).allMatch(TimeSlotDTO::isAvailable);
        assertThat(res.getAvailableSlots().get(0).getAvailableTherapists()).extracting("id").containsExactly(5L);
        assertThat(res.getAvailableSlots().get(0).getAvailableRooms()).extracting("id").containsExactly(101L);
        assertThat(res.getServiceName()).isEqualTo("นวดไทยราชสำนัก");
    }

    @Test
    @DisplayName("UT11-TC002 (V2) date = null → ใช้วันนี้")
    void tc002() {
        AvailabilityResponseDTO res = availabilityService.checkAvailability(null, 1L, 60);
        assertThat(res.getDate()).isEqualTo(LocalDate.now());
    }

    @Test
    @DisplayName("UT11-TC003 (V5) ไม่มี BusinessHours ของวันนั้น → ค่าเริ่มต้น 10:00–21:00 = 11 รอบ")
    void tc003() {
        hours.remove(DayOfWeek.MONDAY);
        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, 60);
        assertThat(res.getAvailableSlots()).hasSize(11);
    }

    @Test
    @DisplayName("UT11-TC004 (V6) T5 หยุด → availableTherapists มีแค่ T8")
    void tc004() {
        onlyQualified(s1, 5L, 8L);
        skills.add(com.fiwdee.testsupport.TestData.skill(7777, t8, s1));
        dayOff(t5, DAY);

        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, 60);

        assertThat(res.getAvailableSlots()).allSatisfy(s ->
                assertThat(s.getAvailableTherapists()).extracting("id").containsExactly(8L));
    }

    @Test
    @DisplayName("UT11-TC005 (V7) R101 มีคิว 13:00–14:00 → รอบ 12:00, 13:00, 14:00 ไม่ว่าง")
    void tc005() {
        existing(500, t1, r101, DAY.atTime(13, 0), 60, BookingStatus.CONFIRMED);

        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, 60);

        assertThat(slot(res, 12).isAvailable()).isFalse();
        assertThat(slot(res, 13).isAvailable()).isFalse();
        assertThat(slot(res, 14).isAvailable()).isFalse();
        assertThat(slot(res, 11).isAvailable()).isTrue();
        assertThat(slot(res, 15).isAvailable()).isTrue();
    }

    @Test
    @DisplayName("UT11-TC006 (V8) คิวเดิมสถานะ COMPLETED ต้องไม่ล็อกห้อง (DEF-006)")
    void tc006() {
        existing(500, t1, r101, DAY.atTime(13, 0), 60, BookingStatus.COMPLETED);

        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, 60);

        assertThat(slot(res, 13).isAvailable()).isTrue();
    }

    @Test
    @DisplayName("UT11-TC007 (I1) serviceId ไม่มี → NotFoundException")
    void tc007() {
        assertThrows(NotFoundException.class, () -> availabilityService.checkAvailability(DAY, 999L, 60));
    }

    @Test
    @DisplayName("UT11-TC008 (I2) service inactive → ValidationException")
    void tc008() {
        assertThrows(ValidationException.class, () -> availabilityService.checkAvailability(DAY, 3L, 60));
    }

    @Test
    @DisplayName("UT11-TC009 (I3) ร้านปิดวันนั้น → ไม่มีรอบ")
    void tc009() {
        hours.get(DayOfWeek.MONDAY).setIsClosed(true);
        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, 60);
        assertThat(res.getAvailableSlots()).isEmpty();
    }
}
