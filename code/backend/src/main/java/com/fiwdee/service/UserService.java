package com.fiwdee.service;

import com.fiwdee.dto.response.AdminUserSummaryResponseDTO;
import com.fiwdee.dto.response.UserResponseDTO;
import java.util.List;

/**
 * User management service — backs the Admin Users summary page (#admin/users).
 */
public interface UserService {

    /** All registered users + counters (total / online / active today / new this month). */
    AdminUserSummaryResponseDTO getAdminUsersSummary();

    /** Users with an active (online) session right now. */
    List<UserResponseDTO> getOnlineUsers();

    /** Force-ends the online session of the given user. */
    void forceLogoutUser(Long userId);

    /** Profile of the currently authenticated user (GET /api/auth/me). */
    UserResponseDTO getUserProfile(Long userId);
}
