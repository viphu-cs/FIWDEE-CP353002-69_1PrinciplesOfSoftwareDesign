package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.entity.TherapistSkill;
import com.fiwdee.domain.entity.WorkShift;
import com.fiwdee.domain.enums.UserRole;
import com.fiwdee.dto.request.TherapistCreateRequestDTO;
import com.fiwdee.dto.request.TherapistScheduleUpdateRequestDTO;
import com.fiwdee.dto.response.TherapistResponseDTO;
import com.fiwdee.dto.response.PublicTherapistResponseDTO;
import com.fiwdee.dto.response.TherapistScheduleResponseDTO;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.TherapistMapper;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.repository.TherapistScheduleRepository;
import com.fiwdee.service.TherapistService;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@Transactional(readOnly = true)
public class TherapistServiceImpl implements TherapistService {
    private final TherapistRepository therapistRepository;
    private final TherapistScheduleRepository scheduleRepository;
    private final ServiceRepository serviceRepository;
    private final TherapistMapper therapistMapper;

    public TherapistServiceImpl(TherapistRepository therapistRepository,
                                TherapistScheduleRepository scheduleRepository,
                                ServiceRepository serviceRepository,
                                TherapistMapper therapistMapper) {
        this.therapistRepository = therapistRepository;
        this.scheduleRepository = scheduleRepository;
        this.serviceRepository = serviceRepository;
        this.therapistMapper = therapistMapper;
    }

    @Override public List<PublicTherapistResponseDTO> getActiveTherapists() {
        return therapistRepository.findByIsActiveTrueAndEmploymentStatusIgnoreCase("ACTIVE").stream()
                .map(therapistMapper::toPublicResponse).toList();
    }

    @Override public List<TherapistResponseDTO> getTherapists(boolean activeOnly) {
        return (activeOnly ? therapistRepository.findByIsActiveTrueAndEmploymentStatusIgnoreCase("ACTIVE")
                : therapistRepository.findAll()).stream().map(therapistMapper::toResponse).toList();
    }

    @Override public TherapistResponseDTO getTherapist(Long id) { return therapistMapper.toResponse(findTherapist(id)); }

    @Override @Transactional public TherapistResponseDTO createTherapist(TherapistCreateRequestDTO request) {
        Therapist therapist = new Therapist();
        // TODO: inject a shared PasswordEncoder when Dev 1 provides that bean; do not store an unencoded password.
        therapist.setPasswordHash(null);
        therapist.setUsername(request.username().trim());
        therapist.setFullName(request.fullName().trim());
        therapist.setEmail(request.email());
        therapist.setPhoneNumber(request.phoneNumber().trim());
        therapist.setRole(UserRole.THERAPIST);
        therapist.setIsActive(true);
        therapist.setNickname(request.nickname().trim());
        therapist.setBio(request.bio());
        therapist.setCommissionRate(request.commissionRate() == null ? BigDecimal.ZERO : request.commissionRate());
        therapist.setEmploymentStatus("ACTIVE");
        therapist.setAverageRating(BigDecimal.ZERO);
        applySkills(therapist, request.serviceIds());
        return therapistMapper.toResponse(therapistRepository.save(therapist));
    }

    @Override @Transactional public TherapistResponseDTO updateTherapist(Long id, TherapistCreateRequestDTO request) {
        Therapist therapist = findTherapist(id);
        therapist.setUsername(request.username().trim());
        therapist.setFullName(request.fullName().trim());
        therapist.setEmail(request.email());
        therapist.setPhoneNumber(request.phoneNumber().trim());
        therapist.setNickname(request.nickname().trim());
        therapist.setBio(request.bio());
        therapist.setCommissionRate(request.commissionRate() == null ? BigDecimal.ZERO : request.commissionRate());
        applySkills(therapist, request.serviceIds());
        return therapistMapper.toResponse(therapistRepository.save(therapist));
    }

    @Override @Transactional public void deleteTherapist(Long id) {
        Therapist therapist = findTherapist(id);
        therapist.setIsActive(false);
        therapist.setEmploymentStatus("INACTIVE");
        therapistRepository.save(therapist);
    }

    @Override public List<TherapistScheduleResponseDTO> getSchedules(Long therapistId) {
        findTherapist(therapistId);
        return scheduleRepository.findByTherapistId(therapistId).stream()
                .sorted(Comparator.comparing(TherapistSchedule::getScheduleDate))
                .map(this::toScheduleResponse).toList();
    }

    @Override @Transactional public TherapistScheduleResponseDTO updateSchedule(Long therapistId, TherapistScheduleUpdateRequestDTO request) {
        Therapist therapist = findTherapist(therapistId);
        List<TherapistScheduleUpdateRequestDTO.ShiftRequest> shifts = request.shifts() == null ? List.of() : request.shifts();
        validateShifts(shifts, Boolean.TRUE.equals(request.dayOff()));
        TherapistSchedule schedule = scheduleRepository.findByTherapistIdAndScheduleDate(therapistId, request.scheduleDate())
                .orElseGet(TherapistSchedule::new);
        schedule.setTherapist(therapist);
        schedule.setScheduleDate(request.scheduleDate());
        schedule.setIsDayOff(request.dayOff());
        schedule.setLeaveReason(request.leaveReason());
        schedule.setNotes(request.notes());
        schedule.getShifts().clear();
        for (TherapistScheduleUpdateRequestDTO.ShiftRequest item : shifts) {
            WorkShift shift = new WorkShift();
            shift.setSchedule(schedule);
            shift.setShiftName(item.shiftName() == null || item.shiftName().isBlank() ? "Shift" : item.shiftName().trim());
            shift.setStartTime(item.startTime());
            shift.setEndTime(item.endTime());
            shift.setShiftStatus(item.shiftStatus() == null || item.shiftStatus().isBlank() ? "ACTIVE" : item.shiftStatus().trim());
            schedule.getShifts().add(shift);
        }
        return toScheduleResponse(scheduleRepository.save(schedule));
    }

    private Therapist findTherapist(Long id) {
        return therapistRepository.findById(id).orElseThrow(() -> new NotFoundException("Therapist", id));
    }

    private void applySkills(Therapist therapist, List<Long> serviceIds) {
        therapist.getSkills().clear();
        if (serviceIds == null) return;
        for (Long serviceId : serviceIds.stream().distinct().toList()) {
            Service service = serviceRepository.findById(serviceId).filter(s -> Boolean.TRUE.equals(s.getIsActive()))
                    .orElseThrow(() -> new NotFoundException("Active service", serviceId));
            TherapistSkill skill = new TherapistSkill();
            skill.setTherapist(therapist);
            skill.setService(service);
            therapist.getSkills().add(skill);
        }
    }

    private void validateShifts(List<TherapistScheduleUpdateRequestDTO.ShiftRequest> shifts, boolean dayOff) {
        if (dayOff && !shifts.isEmpty()) throw new ValidationException("Day-off schedules cannot contain work shifts");
        List<TherapistScheduleUpdateRequestDTO.ShiftRequest> ordered = new ArrayList<>(shifts);
        ordered.sort(Comparator.comparing(TherapistScheduleUpdateRequestDTO.ShiftRequest::startTime));
        for (int i = 0; i < ordered.size(); i++) {
            var shift = ordered.get(i);
            if (!shift.endTime().isAfter(shift.startTime())) throw new ValidationException("Shift end time must be after start time");
            if (i > 0 && shift.startTime().isBefore(ordered.get(i - 1).endTime())) {
                throw new ValidationException("Work shifts must not overlap");
            }
        }
    }

    private TherapistScheduleResponseDTO toScheduleResponse(TherapistSchedule schedule) {
        List<TherapistScheduleResponseDTO.ShiftDTO> shifts = schedule.getShifts().stream()
                .sorted(Comparator.comparing(WorkShift::getStartTime))
                .map(s -> new TherapistScheduleResponseDTO.ShiftDTO(s.getId(), s.getShiftName(), s.getStartTime(), s.getEndTime(), s.getShiftStatus()))
                .toList();
        return new TherapistScheduleResponseDTO(schedule.getId(), schedule.getScheduleDate(), schedule.getIsDayOff(),
                schedule.getLeaveReason(), schedule.getNotes(), shifts);
    }
}
