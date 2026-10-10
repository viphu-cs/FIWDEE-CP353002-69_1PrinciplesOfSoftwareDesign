package com.fiwdee.dto.response;

import java.math.BigDecimal;
import java.util.List;

public record PublicTherapistResponseDTO(Long id, String nickname, String bio, List<String> skills,
                                         BigDecimal averageRating, String photoUrl) {}
