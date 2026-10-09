package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.User;
import com.fiwdee.dto.request.UpdateProfileRequestDTO;
import com.fiwdee.dto.response.AdminUserSummaryResponseDTO;
import com.fiwdee.dto.response.UserResponseDTO;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.UserMapper;
import com.fiwdee.repository.UserRepository;
import com.fiwdee.service.UserSessionService;
import com.fiwdee.service.UserService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
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
    private final PasswordEncoder passwordEncoder;

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
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<UserResponseDTO> getUsersPage(
            com.fiwdee.domain.enums.UserRole role, String search, org.springframework.data.domain.Pageable pageable) {
        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        org.springframework.data.domain.Page<User> page = userRepository.findUsersPage(role, trimmedSearch, pageable);
        return page.map(this::toResponse);
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

    @Override
    @Transactional
    public UserResponseDTO updateProfile(Long userId, UpdateProfileRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User", userId));

        String email = request.getEmail().trim();
        String phoneNumber = request.getPhoneNumber().trim();

        userRepository.findByEmailAndIdNot(email, userId)
                .ifPresent(other -> { throw new ConflictException("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น"); });
        userRepository.findByPhoneNumberAndIdNot(phoneNumber, userId)
                .ifPresent(other -> { throw new ConflictException("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว กรุณาใช้เบอร์อื่น"); });

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()
                    || !passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
                throw new ValidationException("รหัสผ่านปัจจุบันไม่ถูกต้อง");
            }
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPhoneNumber(phoneNumber);

        if (user instanceof Customer customer) {
            customer.setHealthNotes(request.getHealthNotes());
            customer.setPreferredPressure(request.getPreferredPressure());
        }

        User saved = userRepository.save(user);
        return toResponse(saved);
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
