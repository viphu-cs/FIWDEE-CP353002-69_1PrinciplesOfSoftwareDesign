package com.fiwdee.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.List;

public record TherapistCreateRequestDTO(
        @NotBlank String username,
        String password,
        @NotBlank String fullName,
        String email,
        @NotBlank String phoneNumber,
        @NotBlank String nickname,
        String bio,
        String photoUrl,
        @NotNull @DecimalMin("0.00") BigDecimal commissionRate,
        List<Long> serviceIds) {
}
