package com.fiwdee.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceResponseDTO {
    private Long id;
    private String serviceCode;
    private String serviceName;
    private String description;
    private String category;
    private String requiredRoomType;
    private List<DurationOptionDTO> durationOptions;
}
