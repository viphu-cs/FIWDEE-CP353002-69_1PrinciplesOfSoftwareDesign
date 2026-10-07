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
 * Public registration request — always creates a CUSTOMER account
 * (staff accounts are provisioned internally, not via public register).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequestDTO {

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

    @NotBlank(message = "password is required")
    @Size(min = 8, max = 100, message = "password must be between 8 and 100 characters")
    private String password;

    @Size(max = 2000, message = "healthNotes must not exceed 2000 characters")
    private String healthNotes;
}
