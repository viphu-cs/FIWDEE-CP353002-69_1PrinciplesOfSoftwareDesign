package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.User;
import com.fiwdee.dto.response.UserResponseDTO;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import org.springframework.stereotype.Component;

/**
 * Maps User entities to the Admin Users summary DTO.
 * Display formats follow the contract used by the frontend table:
 * registeredAt "yyyy-MM-dd", lastLoginAt "yyyy-MM-dd HH:mm", onlineSince "HH:mm".
 */
@Component
public class UserMapper {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("HH:mm");

    public UserResponseDTO toResponse(User user, String sessionStatus, LocalDateTime onlineSince, long totalBookings) {
        LocalDateTime registeredAt = user instanceof Customer customer
                ? customer.getRegisteredDate()
                : user.getCreatedAt();

        return UserResponseDTO.builder()
                .id(user.getId())
                .name(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhoneNumber())
                .role(user.getRole().name())
                .status(sessionStatus)
                .registeredAt(registeredAt != null ? registeredAt.format(DATE_FORMAT) : null)
                .lastLoginAt(user.getLastLoginAt() != null ? user.getLastLoginAt().format(DATETIME_FORMAT) : null)
                .onlineSince(onlineSince != null ? onlineSince.format(TIME_FORMAT) : null)
                .totalBookings(totalBookings)
                .build();
    }

    public String formatRegisteredDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMAT) : null;
    }
}
