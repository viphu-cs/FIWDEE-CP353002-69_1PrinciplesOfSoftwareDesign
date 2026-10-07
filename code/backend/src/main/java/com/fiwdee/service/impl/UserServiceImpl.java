package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.User;
import com.fiwdee.dto.response.AdminUserSummaryResponseDTO;
import com.fiwdee.dto.response.UserResponseDTO;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.mapper.UserMapper;
import com.fiwdee.repository.UserRepository;
import com.fiwdee.service.UserSessionService;
import com.fiwdee.service.UserService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User management business logic.
 * Session status comes from the in-memory online registry:
 * SUSPENDED (is_active = false) &gt; ONLINE &gt; OFFLINE.
 * totalBookings counts the customer's bookings via the lazy association
 * (BookingRepository is owned by the booking module — read through the entity instead).
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserSessionService userSessionService;
    private final UserMapper userMapper;

    @Override
    @Transactional(readOnly = true)
    public AdminUserSummaryResponseDTO getAdminUsersSummary() {
        LocalDate today = LocalDate.now();
        String currentMonthPrefix = String.format("%04d-%02d", today.getYear(), today.getMonthValue());

        List<User> allUsers = userRepository.findAll();

        List<UserResponseDTO> users = allUsers.stream()
                .map(this::toResponse)
                .sorted(Comparator.comparing(UserResponseDTO::getId))
                .toList();

        long onlineCount = users.stream().filter(u -> "ONLINE".equals(u.getStatus())).count();
        long activeTodayCount = allUsers.stream()
                .filter(u -> u.getLastLoginAt() != null
                        && today.equals(u.getLastLoginAt().toLocalDate()))
                .count();
        long newThisMonthCount = users.stream()
                .filter(u -> u.getRegisteredAt() != null && u.getRegisteredAt().startsWith(currentMonthPrefix))
                .count();

        return AdminUserSummaryResponseDTO.builder()
                .totalUsers((long) users.size())
                .onlineUsers(onlineCount)
                .activeToday(activeTodayCount)
                .newThisMonth(newThisMonthCount)
                .users(users)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getOnlineUsers() {
        return userRepository.findAll().stream()
                .filter(user -> userSessionService.isOnline(user.getId()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void forceLogoutUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new NotFoundException("User", userId);
        }
        userSessionService.endSession(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));
        return toResponse(user);
    }

    private UserResponseDTO toResponse(User user) {
        long totalBookings = user instanceof Customer customer ? customer.getBookings().size() : 0L;

        String status;
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            status = "SUSPENDED";
        } else if (userSessionService.isOnline(user.getId())) {
            status = "ONLINE";
        } else {
            status = "OFFLINE";
        }

        LocalDateTime onlineSince = "ONLINE".equals(status)
                ? userSessionService.getSessionStart(user.getId())
                : null;

        return userMapper.toResponse(user, status, onlineSince, totalBookings);
    }
}
