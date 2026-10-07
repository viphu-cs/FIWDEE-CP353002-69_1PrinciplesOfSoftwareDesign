package com.fiwdee.service.impl;

import com.fiwdee.config.JwtTokenProvider;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.UserRole;
import com.fiwdee.dto.request.LoginRequestDTO;
import com.fiwdee.dto.request.RegisterRequestDTO;
import com.fiwdee.dto.response.AuthResponseDTO;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.repository.CustomerRepository;
import com.fiwdee.repository.UserRepository;
import com.fiwdee.service.AuthService;
import java.time.LocalDateTime;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Authentication business logic.
 * Register always creates a CUSTOMER (staff accounts are provisioned by seed data);
 * login resolves the identifier as email → username → phone number,
 * verifies the BCrypt hash and stamps lastLoginAt.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        String email = request.getEmail().trim();
        String phoneNumber = request.getPhoneNumber().trim();

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น");
        }
        if (userRepository.existsByPhoneNumber(phoneNumber)) {
            throw new ConflictException("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว กรุณาใช้เบอร์อื่น");
        }

        Customer customer = Customer.builder()
                .username(email)
                .fullName(request.getFullName().trim())
                .email(email)
                .phoneNumber(phoneNumber)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.CUSTOMER)
                .healthNotes(request.getHealthNotes())
                .build();

        Customer saved = customerRepository.save(customer);
        log.info("New customer registered: id={} email={}", saved.getId(), saved.getEmail());

        return buildAuthResponse(saved);
    }

    @Override
    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        String identifier = request.getIdentifier().trim();
        User user = resolveUser(identifier)
                .orElseThrow(() -> new BusinessException("อีเมลหรือรหัสผ่านไม่ถูกต้อง", HttpStatus.UNAUTHORIZED));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BusinessException("บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อเจ้าหน้าที่", HttpStatus.UNAUTHORIZED);
        }
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException("อีเมลหรือรหัสผ่านไม่ถูกต้อง", HttpStatus.UNAUTHORIZED);
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("User logged in: id={} role={}", user.getId(), user.getRole());

        return buildAuthResponse(user);
    }

    private Optional<User> resolveUser(String identifier) {
        Optional<User> user = userRepository.findByEmail(identifier);
        if (user.isEmpty()) {
            user = userRepository.findByUsername(identifier);
        }
        if (user.isEmpty()) {
            user = userRepository.findByPhoneNumber(identifier);
        }
        return user;
    }

    private AuthResponseDTO buildAuthResponse(User user) {
        return AuthResponseDTO.builder()
                .token(jwtTokenProvider.generateToken(user))
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole().name())
                .build();
    }
}
