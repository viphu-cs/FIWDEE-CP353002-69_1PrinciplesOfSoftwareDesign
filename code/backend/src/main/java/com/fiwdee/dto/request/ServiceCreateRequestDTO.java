package com.fiwdee.dto.request;

import com.fiwdee.domain.enums.RoomType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMin;
import java.math.BigDecimal;
import java.util.List;

public record ServiceCreateRequestDTO(
        @NotBlank String serviceCode,
        @NotBlank String serviceName,
        String description,
        @NotBlank String category,
        @NotNull RoomType requiredRoomType,
        @NotEmpty @Valid List<DurationRequest> durationOptions) {

    public record DurationRequest(@NotNull @Positive Integer durationMinutes,
                                  @NotNull @DecimalMin("0.00") BigDecimal price) {}
}
