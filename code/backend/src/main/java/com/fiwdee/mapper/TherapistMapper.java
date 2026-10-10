package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.dto.response.TherapistResponseDTO;
import com.fiwdee.dto.response.PublicTherapistResponseDTO;
import java.util.Comparator;
import org.springframework.stereotype.Component;

@Component
public class TherapistMapper {
    public PublicTherapistResponseDTO toPublicResponse(Therapist therapist) {
        return new PublicTherapistResponseDTO(therapist.getId(), therapist.getNickname(), therapist.getBio(),
                therapist.getSkills().stream().filter(skill -> Boolean.TRUE.equals(skill.getService().getIsActive()))
                        .map(skill -> skill.getService().getServiceName()).distinct().sorted(Comparator.naturalOrder()).toList(),
                therapist.getAverageRating(), therapist.getPhotoUrl());
    }

    public TherapistResponseDTO toResponse(Therapist therapist) {
        return new TherapistResponseDTO(therapist.getId(), therapist.getNickname(), therapist.getBio(),
                therapist.getSkills().stream().filter(skill -> Boolean.TRUE.equals(skill.getService().getIsActive()))
                        .map(skill -> skill.getService().getServiceName()).distinct().sorted(Comparator.naturalOrder()).toList(),
                therapist.getAverageRating(), therapist.getFullName(), therapist.getEmail(), therapist.getPhoneNumber(),
                therapist.getCommissionRate(), therapist.getIsActive(), therapist.getPhotoUrl());
    }
}
