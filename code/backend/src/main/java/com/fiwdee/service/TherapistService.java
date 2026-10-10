package com.fiwdee.service;

import com.fiwdee.dto.request.TherapistCreateRequestDTO;
import com.fiwdee.dto.request.TherapistScheduleUpdateRequestDTO;
import com.fiwdee.dto.response.TherapistResponseDTO;
import com.fiwdee.dto.response.PublicTherapistResponseDTO;
import com.fiwdee.dto.response.TherapistScheduleResponseDTO;
import java.util.List;

public interface TherapistService {
    List<PublicTherapistResponseDTO> getActiveTherapists();
    List<TherapistResponseDTO> getTherapists(boolean activeOnly);
    TherapistResponseDTO getTherapist(Long id);
    TherapistResponseDTO createTherapist(TherapistCreateRequestDTO request);
    TherapistResponseDTO updateTherapist(Long id, TherapistCreateRequestDTO request);
    void deleteTherapist(Long id);
    List<TherapistScheduleResponseDTO> getSchedules(Long therapistId);
    TherapistScheduleResponseDTO updateSchedule(Long therapistId, TherapistScheduleUpdateRequestDTO request);
}
