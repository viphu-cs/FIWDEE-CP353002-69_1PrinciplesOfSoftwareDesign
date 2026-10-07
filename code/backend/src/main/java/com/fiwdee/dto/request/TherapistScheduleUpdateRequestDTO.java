package com.fiwdee.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record TherapistScheduleUpdateRequestDTO(@NotNull LocalDate scheduleDate,
                                                @NotNull Boolean dayOff,
                                                String leaveReason,
                                                String notes,
                                                @Valid List<ShiftRequest> shifts) {
    public record ShiftRequest(String shiftName, @NotNull LocalTime startTime,
                               @NotNull LocalTime endTime, String shiftStatus) {}
}
