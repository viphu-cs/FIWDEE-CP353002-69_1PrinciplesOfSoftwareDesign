package com.fiwdee.service.impl;


import com.fiwdee.domain.entity.TherapistSchedule;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Optional;

final class ScheduleRules {

    private ScheduleRules() {
    }

    static boolean onShift(Optional<TherapistSchedule> schedule, LocalDateTime start, LocalDateTime end) {

        if (schedule.isEmpty() || schedule.get().getShifts().isEmpty()) {
            return true;
        }
        LocalTime from = start.toLocalTime();
        LocalTime to = end.toLocalTime();

        return schedule.get().getShifts().stream()
                .filter(w -> !"CANCELLED".equalsIgnoreCase(w.getShiftStatus()))
                .anyMatch(w -> !from.isBefore(w.getStartTime()) && !to.isAfter(w.getEndTime()));
    }
}
