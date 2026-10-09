package com.fiwdee.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Availability information for a service on a given date.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailabilityResponseDTO {

    private LocalDate date;
    private Long serviceId;
    private String serviceName;
    private Integer durationMinutes;
    private List<TimeSlotDTO> availableSlots;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimeSlotDTO {
        private String time;
        private LocalTime startTime;
        private LocalTime endTime;
        private boolean available;
        private List<AvailableTherapistDTO> availableTherapists;
        private List<AvailableRoomDTO> availableRooms;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AvailableTherapistDTO {
        private Long id;
        private String name;
        private String nickname;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AvailableRoomDTO {
        private Long id;
        private String roomNumber;
        private String roomType;
    }
}
