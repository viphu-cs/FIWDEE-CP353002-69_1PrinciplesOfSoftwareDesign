package com.fiwdee.service;

import com.fiwdee.dto.request.LoginRequestDTO;
import com.fiwdee.dto.request.RegisterRequestDTO;
import com.fiwdee.dto.response.AuthResponseDTO;

/**
 * Authentication service — public registration (Customer) and login issuing JWT tokens.
 */
public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);
}
