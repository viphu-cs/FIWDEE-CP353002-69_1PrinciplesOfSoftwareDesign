package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.service.impl.TherapistServiceImpl;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.entity.WorkShift;
import com.fiwdee.dto.request.TherapistScheduleUpdateRequestDTO;
import com.fiwdee.dto.request.TherapistScheduleUpdateRequestDTO.ShiftRequest;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.TherapistMapper;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.repository.TherapistScheduleRepository;
import com.fiwdee.testsupport.TestData;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/**
 * UT34 – TherapistServiceImpl.updateSchedule / validateShifts (Robustness BVA ขอบด้านเดียว)
 * ตัวแปร 1: ความยาวกะ (ขอบ end > start) • ตัวแปร 2: ช่องว่างระหว่างกะ (ขอบ ≥ 0)
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT34 updateSchedule – shift BVA")
class UT34_ScheduleShiftTest {

    @Mock TherapistRepository therapistRepository;
    @Mock TherapistScheduleRepository scheduleRepository;
    @Mock ServiceRepository serviceRepository;
    @Mock TherapistMapper therapistMapper;
    @InjectMocks TherapistServiceImpl therapistService;

    @BeforeEach
    void world() {
        when(therapistRepository.findById(5L)).thenReturn(Optional.of(TestData.therapist(5, "มะลิ", true)));
        when(scheduleRepository.findByTherapistIdAndScheduleDate(any(), any())).thenReturn(Optional.empty());
        when(scheduleRepository.save(any(TherapistSchedule.class))).thenAnswer(i -> i.getArgument(0));
    }

    /** "10:00-14:00;14:00-18:00" → รายการกะ (ชื่อ/สถานะว่างเพื่อทดสอบค่าเริ่มต้น) */
    private static List<ShiftRequest> shifts(String spec) {
        List<ShiftRequest> list = new ArrayList<>();
        if (spec == null || spec.isBlank()) {
            return list;
        }
        for (String s : spec.split(";")) {
            String[] t = s.trim().split("-");
            list.add(new ShiftRequest(null, LocalTime.parse(t[0]), LocalTime.parse(t[1]), null));
        }
        return list;
    }

    private void update(boolean dayOff, String spec) {
        therapistService.updateSchedule(5L, new TherapistScheduleUpdateRequestDTO(
                TestData.DAY, dayOff, null, null, shifts(spec)));
    }

    private TherapistSchedule saved() {
        ArgumentCaptor<TherapistSchedule> captor = ArgumentCaptor.forClass(TherapistSchedule.class);
        verify(scheduleRepository).save(captor.capture());
        return captor.getValue();
    }

    /** error ว่าง = ต้องบันทึกสำเร็จ และมีจำนวนกะ = shiftCount */
    @ParameterizedTest(name = "{0} dayOff={1} [{2}] → {4}")
    @CsvSource(delimiter = '|', value = {
        "UT34-TC001 | false | 10:00-18:00              | 1 | ''",
        "UT34-TC002 | false | 10:00-10:00              | 0 | Shift end time must be after start time",
        "UT34-TC003 | false | 10:00-10:01              | 1 | ''",
        "UT34-TC004 | false | 10:00-10:02              | 1 | ''",
        "UT34-TC005 | false | 10:00-14:00;13:59-18:00  | 0 | Work shifts must not overlap",
        "UT34-TC006 | false | 10:00-14:00;14:00-18:00  | 2 | ''",
        "UT34-TC007 | false | 10:00-14:00;14:01-18:00  | 2 | ''",
        "UT34-TC008 | false | 15:00-18:00;10:00-14:00  | 2 | ''",
        "UT34-TC009 | true  | 10:00-18:00              | 0 | Day-off schedules cannot contain work shifts",
        "UT34-TC010 | true  | ''                       | 0 | ''"
    })
    void shift(String tc, boolean dayOff, String spec, int shiftCount, String error) {
        if (error.isEmpty()) {
            update(dayOff, spec);
            TherapistSchedule s = saved();
            assertThat(s.getIsDayOff()).isEqualTo(dayOff);
            assertThat(s.getShifts()).as(tc).hasSize(shiftCount);
            assertThat(s.getShifts()).allSatisfy(w -> {
                assertThat(w.getShiftName()).isEqualTo("Shift");
                assertThat(w.getShiftStatus()).isEqualTo("ACTIVE");
            });
        } else {
            ValidationException ex = assertThrows(ValidationException.class, () -> update(dayOff, spec), tc);
            assertThat(ex.getMessage()).isEqualTo(error);
            verify(scheduleRepository, never()).save(any());
        }
    }

    @Test
    @DisplayName("UT34-TC008 (เพิ่มเติม) กะที่ส่งไม่เรียงเวลา ยังเก็บครบทั้ง 2 กะตามเวลาที่ส่ง")
    void tc008Detail() {
        update(false, "15:00-18:00;10:00-14:00");
        assertThat(saved().getShifts()).extracting(WorkShift::getStartTime)
                .containsExactlyInAnyOrder(LocalTime.of(15, 0), LocalTime.of(10, 0));
    }
}
