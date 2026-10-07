package com.fiwdee.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record TherapistResponseDTO(Long id, String nickname, String bio, List<String> skills,
                                   BigDecimal averageRating, String fullName, String email,
                                   String phoneNumber, BigDecimal commissionRate, Boolean isActive) {}
