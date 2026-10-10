package com.fiwdee.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Per-user record for the Admin Users summary page.
 * Field names mirror the retired mock data shape so the frontend swap is 1:1:
 * status ∈ ONLINE / OFFLINE / SUSPENDED; date fields are pre-formatted
 * ("yyyy-MM-dd", "yyyy-MM-dd HH:mm", "HH:mm").
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {

    private Long id;

    private String name;

    private String email;

    private String phone;

    private String role;

    private String status;

    private String registeredAt;

    private String lastLoginAt;

    private String onlineSince;

    private Long totalBookings;

    // Profile fields for GET /api/auth/me — null unless the user is a Customer
    private String username;

    private String healthNotes;

    private String preferredPressure;
}
