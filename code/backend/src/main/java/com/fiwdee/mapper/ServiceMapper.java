package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Service;
import com.fiwdee.dto.response.DurationOptionDTO;
import com.fiwdee.dto.response.ServiceResponseDTO;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ServiceMapper {

    public ServiceResponseDTO toResponse(Service service) {
        List<DurationOptionDTO> options = service.getDurationOptions().stream()
                .filter(option -> Boolean.TRUE.equals(option.getIsActive()))
                .sorted(Comparator.comparing(option -> option.getDurationMinutes()))
                .map(option -> new DurationOptionDTO(option.getDurationMinutes(), option.getPrice()))
                .toList();

        return new ServiceResponseDTO(
                service.getId(),
                service.getServiceCode(),
                service.getServiceName(),
                service.getDescription(),
                service.getCategory(),
                service.getRequiredRoomType() == null ? null : service.getRequiredRoomType().name(),
                options);
    }
}
