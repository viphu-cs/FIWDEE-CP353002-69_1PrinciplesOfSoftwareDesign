package com.fiwdee.dto.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Aggregate response for GET /api/admin/users — summary counters
 * (per TASKS.md 2.14) plus the full registered-users list.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserSummaryResponseDTO {

    private Long totalUsers;

    private Long onlineUsers;

    private Long activeToday;

    private Long newThisMonth;

    private List<UserResponseDTO> users;
}
