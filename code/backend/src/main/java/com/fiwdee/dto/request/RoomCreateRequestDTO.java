package com.fiwdee.dto.request;

import com.fiwdee.domain.enums.RoomType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record RoomCreateRequestDTO(@NotBlank String roomNumber,
                                   @NotNull RoomType roomType,
                                   @NotNull @Positive Integer capacity,
                                   @NotNull @PositiveOrZero Integer cleaningBufferMinutes) {
}
