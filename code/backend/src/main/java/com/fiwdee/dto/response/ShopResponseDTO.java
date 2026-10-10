package com.fiwdee.dto.response;

import com.fiwdee.domain.enums.DayOfWeek;
import java.time.LocalTime;
import java.util.List;

public record ShopResponseDTO(Long id, String shopName, String address, String phoneNumber,
                              String description, List<BusinessHoursDTO> businessHours) {
    public record BusinessHoursDTO(DayOfWeek dayOfWeek, LocalTime openTime, LocalTime closeTime, Boolean closed) {}
}
