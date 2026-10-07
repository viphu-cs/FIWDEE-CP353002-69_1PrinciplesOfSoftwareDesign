package com.fiwdee.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Update-own-profile request (PUT /api/auth/me).
 * currentPassword/newPassword are optional — they are only required together
 * when the caller wants to change the password.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequestDTO {

    @NotBlank(message = "fullName is required")
    @Size(max = 100, message = "fullName must not exceed 100 characters")
    private String fullName;

    @NotBlank(message = "email is required")
    @Email(message = "email must be a valid email address")
    @Size(max = 100, message = "email must not exceed 100 characters")
    private String email;

    @NotBlank(message = "phoneNumber is required")
    @Size(max = 20, message = "phoneNumber must not exceed 20 characters")
    private String phoneNumber;

    @Size(max = 2000, message = "healthNotes must not exceed 2000 characters")
    private String healthNotes;

    @Size(max = 50, message = "preferredPressure must not exceed 50 characters")
    private String preferredPressure;

    @Size(max = 100, message = "currentPassword must not exceed 100 characters")
    private String currentPassword;

    @Size(min = 8, max = 100, message = "newPassword must be between 8 and 100 characters")
    private String newPassword;
}
