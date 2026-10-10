package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.config.JwtTokenProvider;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.enums.UserRole;
import com.fiwdee.dto.request.RegisterRequestDTO;
import com.fiwdee.dto.response.AuthResponseDTO;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.repository.CustomerRepository;
import com.fiwdee.repository.UserRepository;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.crypto.password.PasswordEncoder;

/** UT28 – AuthServiceImpl.register (Weak Robust EC) */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT28 AuthService.register – EC")
class UT28_RegisterTest {

    @Mock UserRepository userRepository;
    @Mock CustomerRepository customerRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;
    @InjectMocks AuthServiceImpl authService;

    /** ข้อมูลที่มีอยู่แล้วในระบบ */
    private static final Set<String> EMAILS = Set.of("customer@test.com");
    private static final Set<String> PHONES = Set.of("081-000-3333");

    @BeforeEach
    void world() {
        when(userRepository.existsByEmail(anyString())).thenAnswer(i -> EMAILS.contains(i.<String>getArgument(0)));
        when(userRepository.existsByPhoneNumber(anyString())).thenAnswer(i -> PHONES.contains(i.<String>getArgument(0)));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(customerRepository.save(any(Customer.class))).thenAnswer(i -> {
            Customer c = i.getArgument(0);
            c.setId(77L);
            return c;
        });
        when(jwtTokenProvider.generateToken(any())).thenReturn("jwt-token");
    }

    private AuthResponseDTO register(String email, String phone) {
        return authService.register(RegisterRequestDTO.builder()
                .fullName("สมชาย ใจดี").email(email).phoneNumber(phone).password("password123").build());
    }

    private Customer savedCustomer() {
        ArgumentCaptor<Customer> captor = ArgumentCaptor.forClass(Customer.class);
        verify(customerRepository).save(captor.capture());
        return captor.getValue();
    }

    @Test
    @DisplayName("UT28-TC001 (V1) อีเมลและเบอร์ไม่ซ้ำ → save Customer, เก็บแค่ hash, คืน token")
    void tc001() {
        AuthResponseDTO res = register("new@test.com", "0812223333");

        Customer c = savedCustomer();
        assertThat(c.getRole()).isEqualTo(UserRole.CUSTOMER);
        assertThat(c.getUsername()).isEqualTo("new@test.com");
        assertThat(c.getPasswordHash()).isEqualTo("hashed").isNotEqualTo("password123");
        assertThat(res.getToken()).isEqualTo("jwt-token");
        assertThat(res.getRole()).isEqualTo("CUSTOMER");
    }

    @Test
    @DisplayName("UT28-TC002 (V2) email/phone มีช่องว่าง → ถูก trim")
    void tc002() {
        register(" new@test.com ", " 0812223333 ");
        Customer c = savedCustomer();
        assertThat(c.getEmail()).isEqualTo("new@test.com");
        assertThat(c.getPhoneNumber()).isEqualTo("0812223333");
    }

    @Test
    @DisplayName("UT28-TC003 (I1) อีเมลซ้ำ → ConflictException • ไม่ save")
    void tc003() {
        ConflictException ex = assertThrows(ConflictException.class, () -> register("customer@test.com", "0812223333"));
        assertThat(ex.getMessage()).startsWith("อีเมลนี้ถูกใช้งานแล้ว");
        verify(customerRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT28-TC004 (I2) เบอร์ซ้ำ → ConflictException")
    void tc004() {
        ConflictException ex = assertThrows(ConflictException.class, () -> register("new@test.com", "081-000-3333"));
        assertThat(ex.getMessage()).startsWith("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว");
        verify(customerRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT28-TC005 (I3) ซ้ำทั้งคู่ → ConflictException เรื่องอีเมลก่อน")
    void tc005() {
        ConflictException ex = assertThrows(ConflictException.class, () -> register("customer@test.com", "081-000-3333"));
        assertThat(ex.getMessage()).startsWith("อีเมลนี้ถูกใช้งานแล้ว");
    }
}
