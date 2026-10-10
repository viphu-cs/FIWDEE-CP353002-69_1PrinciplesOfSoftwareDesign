package com.fiwdee.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record TherapistScheduleResponseDTO(Long id, LocalDate scheduleDate, Boolean dayOff,
                                           String leaveReason, String notes, List<ShiftDTO> shifts) {
    public record ShiftDTO(Long id, String shiftName, LocalTime startTime, LocalTime endTime, String shiftStatus) {}
}
