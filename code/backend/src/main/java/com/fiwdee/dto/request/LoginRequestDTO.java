package com.fiwdee.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Login request — identifier accepts email, username or phone number
 * (customer login page allows phone OR email).
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequestDTO {

    @NotBlank(message = "identifier is required")
    private String identifier;

    @NotBlank(message = "password is required")
    private String password;
}
