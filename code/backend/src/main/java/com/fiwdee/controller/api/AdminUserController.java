package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.response.AdminUserSummaryResponseDTO;
import com.fiwdee.dto.response.UserResponseDTO;
import com.fiwdee.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin Users summary endpoints — Owner only (see BACKEND_TEAM_ROLES.md / UC-28).
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<AdminUserSummaryResponseDTO>> getUsersSummary() {
        AdminUserSummaryResponseDTO summary = userService.getAdminUsersSummary();
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลผู้ใช้ทั้งหมดสำเร็จ", summary));
    }

    @GetMapping("/online")
    public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getOnlineUsers() {
        List<UserResponseDTO> onlineUsers = userService.getOnlineUsers();
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลผู้ใช้ออนไลน์สำเร็จ", onlineUsers));
    }

    @PostMapping("/{id}/force-logout")
    public ResponseEntity<ApiResponse<Void>> forceLogout(@PathVariable Long id) {
        userService.forceLogoutUser(id);
        return ResponseEntity.ok(ApiResponse.success("บังคับออกจากระบบสำเร็จ", null));
    }
}
