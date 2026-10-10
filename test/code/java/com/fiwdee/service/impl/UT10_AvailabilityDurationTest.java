package com.fiwdee.service.impl;

import static com.fiwdee.testsupport.TestData.DAY;
import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.dto.response.AvailabilityResponseDTO;
import com.fiwdee.dto.response.AvailabilityResponseDTO.TimeSlotDTO;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * UT10 – AvailabilityServiceImpl.checkAvailability: จำนวนรอบตาม durationMinutes (Robustness BVA)
 * 2026-11-09 (จันทร์) เปิด 10:00–22:00 • T5 + R101 ว่าง • รอบเริ่มทุก 60 นาที ต้องจบไม่เกินเวลาปิด
 */
@DisplayName("UT10 checkAvailability – durationMinutes Robustness BVA")
class UT10_AvailabilityDurationTest extends BookingWorldTestBase {

    @BeforeEach
    void singleTherapistSingleRoom() {
        onlyQualified(s1, 5L);
        rooms.removeIf(r -> r != r101);
    }

    @ParameterizedTest(name = "{0} durationMinutes = {1} → {3} รอบ")
    @CsvSource({
        "UT10-TC001, 0,   60,  12, 10:00, 21:00",
        "UT10-TC002, 1,   1,   12, 10:00, 21:00",
        "UT10-TC003, 2,   2,   12, 10:00, 21:00",
        "UT10-TC004, 90,  90,  11, 10:00, 20:00",
        "UT10-TC005, 719, 719, 1,  10:00, 10:00",
        "UT10-TC006, 720, 720, 1,  10:00, 10:00"
    })
    void slotCount(String tc, int duration, int effectiveDuration, int slots, LocalTime first, LocalTime last) {
        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, duration);

        List<TimeSlotDTO> list = res.getAvailableSlots();
        assertThat(res.getDurationMinutes()).isEqualTo(effectiveDuration);
        assertThat(list).hasSize(slots);
        assertThat(list.get(0).getStartTime()).isEqualTo(first);
        assertThat(list.get(list.size() - 1).getStartTime()).isEqualTo(last);
        assertThat(list).allMatch(TimeSlotDTO::isAvailable);
        assertThat(list.get(list.size() - 1).getEndTime()).isBeforeOrEqualTo(LocalTime.of(22, 0));
    }

    @Test
    @DisplayName("UT10-TC007 durationMinutes = 721 → 0 รอบ")
    void tc007() {
        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, 721);
        assertThat(res.getAvailableSlots()).isEmpty();
    }

    @Test
    @Tag("known-defect")
    @DisplayName("UT10-TC008 durationMinutes = 900 (เวลาวนข้ามเที่ยงคืน) → 0 รอบ (DEF-012)")
    void tc008() {
        AvailabilityResponseDTO res = availabilityService.checkAvailability(DAY, 1L, 900);
        assertThat(res.getAvailableSlots()).isEmpty();
    }
}
