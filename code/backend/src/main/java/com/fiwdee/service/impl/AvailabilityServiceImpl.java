package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.BusinessHours;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.entity.TherapistSkill;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.DayOfWeek;
import com.fiwdee.dto.response.AvailabilityResponseDTO;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.BusinessHoursRepository;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.repository.ServiceDurationOptionRepository;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.repository.TherapistScheduleRepository;
import com.fiwdee.repository.TherapistSkillRepository;
import com.fiwdee.service.AvailabilityService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AvailabilityService enforcing business opening hours,
 * therapist skills & schedules, and the mandatory 15-minute cleaning buffer for rooms (UC-08).
 */
@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AvailabilityServiceImpl implements AvailabilityService {

    public static final int CLEANING_BUFFER_MINUTES = 15;
    private static final Collection<BookingStatus> EXCLUDED_STATUSES = List.of(
            BookingStatus.CANCELLED,
            BookingStatus.NO_SHOW
    );

    private final ServiceRepository serviceRepository;
    private final ServiceDurationOptionRepository durationOptionRepository;
    private final RoomRepository roomRepository;
    private final TherapistRepository therapistRepository;
    private final TherapistSkillRepository therapistSkillRepository;
    private final TherapistScheduleRepository therapistScheduleRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final BookingRepository bookingRepository;

    @Override
    public AvailabilityResponseDTO checkAvailability(LocalDate date, Long serviceId, Integer durationMinutes) {
        if (date == null) {
            date = LocalDate.now();
        }

        Service service = serviceRepository.findById(serviceId)
                .orElseThrow(() -> new NotFoundException("Service not found with id: " + serviceId));

        if (!Boolean.TRUE.equals(service.getIsActive())) {
            throw new ValidationException("Selected service is currently inactive");
        }

        // Determine effective duration: fallback to first active duration option or 60 min
        int duration = 60;
        if (durationMinutes != null && durationMinutes > 0) {
            duration = durationMinutes;
        } else {
            List<ServiceDurationOption> options = durationOptionRepository.findByServiceIdAndIsActiveTrue(serviceId);
            if (!options.isEmpty()) {
                duration = options.get(0).getDurationMinutes();
            }
        }

        // 1. Operating hours
        DayOfWeek dow = mapDayOfWeek(date.getDayOfWeek());
        Optional<BusinessHours> hoursOpt = businessHoursRepository.findByDayOfWeek(dow);

        LocalTime openTime = LocalTime.of(10, 0);
        LocalTime closeTime = LocalTime.of(21, 0);
        boolean isClosed = false;

        if (hoursOpt.isPresent()) {
            BusinessHours hours = hoursOpt.get();
            if (Boolean.TRUE.equals(hours.getIsClosed())) {
                isClosed = true;
            } else {
                openTime = hours.getOpenTime();
                closeTime = hours.getCloseTime();
            }
        }

        if (isClosed) {
            return AvailabilityResponseDTO.builder()
                    .date(date)
                    .serviceId(service.getId())
                    .serviceName(service.getServiceName())
                    .durationMinutes(duration)
                    .availableSlots(List.of())
                    .build();
        }

        // 2. Eligible therapists (with matching skill)
        List<TherapistSkill> skills = therapistSkillRepository.findByServiceId(serviceId);
        List<Therapist> eligibleTherapists = skills.stream()
                .map(TherapistSkill::getTherapist)
                .filter(t -> t != null && Boolean.TRUE.equals(t.getIsActive()))
                .distinct()
                .toList();

        // 3. Eligible rooms (active and matching room type requirement)
        List<Room> activeRooms = roomRepository.findByIsActiveTrue();
        List<Room> candidateRooms = activeRooms.stream()
                .filter(r -> service.getRequiredRoomType() == null || r.getRoomType() == service.getRequiredRoomType())
                .toList();

        // 4. Iterate over time slots
        List<AvailabilityResponseDTO.TimeSlotDTO> slotDTOs = new ArrayList<>();
        LocalTime slotTime = openTime;

        while (!slotTime.plusMinutes(duration).isAfter(closeTime)) {
            LocalDateTime slotStart = LocalDateTime.of(date, slotTime);
            LocalDateTime slotEnd = slotStart.plusMinutes(duration);

            // Filter therapists available for this slot
            List<AvailabilityResponseDTO.AvailableTherapistDTO> availableTherapists = new ArrayList<>();
            for (Therapist therapist : eligibleTherapists) {
                Optional<TherapistSchedule> schedOpt = therapistScheduleRepository
                        .findByTherapistIdAndScheduleDate(therapist.getId(), date);
                if (schedOpt.isPresent() && Boolean.TRUE.equals(schedOpt.get().getIsDayOff())) {
                    continue;
                }
                if (!ScheduleRules.onShift(schedOpt, slotStart, slotEnd)) {
                    continue;
                }

                List<Booking> conflicts = bookingRepository.findConflictingTherapistBookings(
                        therapist.getId(), slotStart, slotEnd, EXCLUDED_STATUSES);
                if (conflicts.isEmpty()) {
                    availableTherapists.add(AvailabilityResponseDTO.AvailableTherapistDTO.builder()
                            .id(therapist.getId())
                            .name(therapist.getFullName())
                            .nickname(therapist.getNickname())
                            .build());
                }
            }

            // Filter rooms available for this slot (with 15-minute cleaning buffer)
            List<AvailabilityResponseDTO.AvailableRoomDTO> availableRooms = new ArrayList<>();
            for (Room room : candidateRooms) {
                List<Booking> roomConflicts = bookingRepository.findConflictingRoomBookingsWithCleaningBuffer(
                        room.getId(), slotStart, slotEnd, CLEANING_BUFFER_MINUTES, EXCLUDED_STATUSES);
                if (roomConflicts.isEmpty()) {
                    availableRooms.add(AvailabilityResponseDTO.AvailableRoomDTO.builder()
                            .id(room.getId())
                            .roomNumber(room.getRoomNumber())
                            .roomType(room.getRoomType() != null ? room.getRoomType().name() : null)
                            .build());
                }
            }

            boolean isAvailable = !availableTherapists.isEmpty() && !availableRooms.isEmpty();

            slotDTOs.add(AvailabilityResponseDTO.TimeSlotDTO.builder()
                    .time(slotTime.toString())
                    .startTime(slotTime)
                    .endTime(slotTime.plusMinutes(duration))
                    .available(isAvailable)
                    .availableTherapists(availableTherapists)
                    .availableRooms(availableRooms)
                    .build());

            slotTime = slotTime.plusMinutes(60);
        }

        return AvailabilityResponseDTO.builder()
                .date(date)
                .serviceId(service.getId())
                .serviceName(service.getServiceName())
                .durationMinutes(duration)
                .availableSlots(slotDTOs)
                .build();
    }

    private DayOfWeek mapDayOfWeek(java.time.DayOfWeek dow) {
        return switch (dow) {
            case MONDAY -> DayOfWeek.MONDAY;
            case TUESDAY -> DayOfWeek.TUESDAY;
            case WEDNESDAY -> DayOfWeek.WEDNESDAY;
            case THURSDAY -> DayOfWeek.THURSDAY;
            case FRIDAY -> DayOfWeek.FRIDAY;
            case SATURDAY -> DayOfWeek.SATURDAY;
            case SUNDAY -> DayOfWeek.SUNDAY;
        };
    }
}
