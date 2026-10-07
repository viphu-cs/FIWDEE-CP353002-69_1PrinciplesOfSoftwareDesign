package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.domain.entity.User;
import com.fiwdee.dto.request.LoginRequestDTO;
import com.fiwdee.dto.request.RegisterRequestDTO;
import com.fiwdee.dto.request.UpdateProfileRequestDTO;
import com.fiwdee.dto.response.AuthResponseDTO;
import com.fiwdee.dto.response.UserResponseDTO;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.service.AuthService;
import com.fiwdee.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public authentication endpoints (register / login) + current-profile lookup.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterRequestDTO request) {
        AuthResponseDTO response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("สมัครสมาชิกสำเร็จ", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponseDTO>> login(@Valid @RequestBody LoginRequestDTO request) {
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("เข้าสู่ระบบสำเร็จ", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>> me(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required. Please provide a valid Bearer token",
                    HttpStatus.UNAUTHORIZED);
        }
        UserResponseDTO profile = userService.getUserProfile(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลผู้ใช้สำเร็จ", profile));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDTO>> updateMe(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody UpdateProfileRequestDTO request) {
        if (currentUser == null) {
            throw new BusinessException("Authentication required. Please provide a valid Bearer token",
                    HttpStatus.UNAUTHORIZED);
        }
        UserResponseDTO profile = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("บันทึกข้อมูลผู้ใช้สำเร็จ", profile));
    }
}
