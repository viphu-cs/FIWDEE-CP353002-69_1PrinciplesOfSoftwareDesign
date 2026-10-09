package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.response.AdminUserSummaryResponseDTO;
import com.fiwdee.dto.response.UserResponseDTO;
import com.fiwdee.service.UserService;
import com.fiwdee.domain.enums.UserRole;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin Users summary endpoints — Owner only (see BACKEND_TEAM_ROLES.md / UC-28).
 */
@Tag(name = "Admin Users", description = "จัดการและตรวจสอบผู้ใช้ในระบบ รายชื่อผู้ใช้ออนไลน์ และ Force Logout (สิทธิ์ OWNER)")
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

    /**
     * Paginated and sorted endpoint for users list (UC-28).
     * Supports ?page=0&size=10&sort=createdAt,desc (or sort=fullName,asc)
     * and optional filters ?role=CUSTOMER, ?search=somchai
     */
    @GetMapping("/page")
    public ResponseEntity<ApiResponse<Page<UserResponseDTO>>> getUsersPage(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String search,
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<UserResponseDTO> usersPage = userService.getUsersPage(role, search, pageable);
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลผู้ใช้แบบแบ่งหน้าสำเร็จ", usersPage));
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
