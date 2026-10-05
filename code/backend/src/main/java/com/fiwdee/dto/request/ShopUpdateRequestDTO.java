package com.fiwdee.dto.request;

import com.fiwdee.domain.enums.DayOfWeek;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalTime;
import java.util.List;

public record ShopUpdateRequestDTO(@NotBlank String shopName,
                                   @NotBlank String address,
                                   @NotBlank String phoneNumber,
                                   String description,
                                   @Valid List<BusinessHoursRequest> businessHours) {
    public record BusinessHoursRequest(@NotNull DayOfWeek dayOfWeek,
                                      @NotNull LocalTime openTime,
                                      @NotNull LocalTime closeTime,
                                      @NotNull Boolean closed) {}
}
