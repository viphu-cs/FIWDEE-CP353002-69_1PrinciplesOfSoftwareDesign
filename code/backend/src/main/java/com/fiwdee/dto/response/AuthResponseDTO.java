package com.fiwdee.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Authentication response — returned by register and login.
 * Field names follow the AGENTS.md §5 contract (token, role, username, fullName).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;

    @Builder.Default
    private String tokenType = "Bearer";

    private Long userId;

    private String username;

    private String fullName;

    private String email;

    private String phoneNumber;

    private String role;
}
