package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.service.impl.AuthServiceImpl;
import com.fiwdee.config.JwtTokenProvider;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.User;
import com.fiwdee.dto.request.LoginRequestDTO;
import com.fiwdee.dto.response.AuthResponseDTO;
import com.fiwdee.exception.BusinessException;
import com.fiwdee.repository.CustomerRepository;
import com.fiwdee.repository.UserRepository;
import com.fiwdee.testsupport.TestData;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;

/** UT27 – AuthServiceImpl.login (Decision Table, Limited Entry: R1–R4) */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT27 AuthService.login – Decision Table")
class UT27_LoginTest {

    @Mock UserRepository userRepository;
    @Mock CustomerRepository customerRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtTokenProvider jwtTokenProvider;
    @InjectMocks AuthServiceImpl authService;

    private Customer customer;

    @BeforeEach
    void world() {
        customer = TestData.customer(1);
        customer.setUsername("customer");
        customer.setEmail("customer@test.com");
        customer.setPhoneNumber("081-000-3333");
        customer.setPasswordHash("$2a$hash");

        // fake: ค้นหาตาม field จริงของ customer (ค่าอื่นได้ Optional.empty())
        when(userRepository.findByEmail(anyString())).thenAnswer(i ->
                Optional.<User>ofNullable(i.getArgument(0).equals(customer.getEmail()) ? customer : null));
        when(userRepository.findByUsername(anyString())).thenAnswer(i ->
                Optional.<User>ofNullable(i.getArgument(0).equals(customer.getUsername()) ? customer : null));
        when(userRepository.findByPhoneNumber(anyString())).thenAnswer(i ->
                Optional.<User>ofNullable(i.getArgument(0).equals(customer.getPhoneNumber()) ? customer : null));
        when(passwordEncoder.matches("customer1234", "$2a$hash")).thenReturn(true);
        when(jwtTokenProvider.generateToken(any())).thenReturn("jwt-token");
    }

    private AuthResponseDTO login(String identifier, String password) {
        return authService.login(LoginRequestDTO.builder().identifier(identifier).password(password).build());
    }

    private void assertUnauthorized(String identifier, String password, String message) {
        BusinessException ex = assertThrows(BusinessException.class, () -> login(identifier, password));
        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(ex.getMessage()).startsWith(message);
        assertThat(customer.getLastLoginAt()).isNull();
        verify(userRepository, never()).save(any());
    }

    private void assertSuccess(AuthResponseDTO res) {
        assertThat(res.getToken()).isEqualTo("jwt-token");
        assertThat(res.getRole()).isEqualTo("CUSTOMER");
        assertThat(customer.getLastLoginAt()).isNotNull();
        verify(userRepository, times(1)).save(customer);
    }

    @Test
    @DisplayName("UT27-TC001 [R1] ไม่พบผู้ใช้ → 401 อีเมลหรือรหัสผ่านไม่ถูกต้อง")
    void tc001() {
        assertUnauthorized("nobody@test.com", "x", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    @Test
    @DisplayName("UT27-TC002 [R2] บัญชีถูกระงับ → 401 บัญชีนี้ถูกระงับ • ไม่ตรวจรหัสผ่าน")
    void tc002() {
        customer.setIsActive(false);
        assertUnauthorized("customer@test.com", "customer1234", "บัญชีนี้ถูกระงับการใช้งาน");
        verify(passwordEncoder, never()).matches(any(), any());
    }

    @Test
    @DisplayName("UT27-TC003 [R3] รหัสผ่านผิด → 401 • lastLoginAt ไม่เปลี่ยน")
    void tc003() {
        assertUnauthorized("customer@test.com", "wrong", "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    @Test
    @DisplayName("UT27-TC004 [R4] login ด้วยอีเมล → สำเร็จ")
    void tc004() {
        assertSuccess(login("customer@test.com", "customer1234"));
    }

    @Test
    @DisplayName("UT27-TC005 [R4] login ด้วย username → สำเร็จ")
    void tc005() {
        assertSuccess(login("customer", "customer1234"));
        verify(userRepository).findByUsername("customer");
    }

    @Test
    @DisplayName("UT27-TC006 [R4] login ด้วยเบอร์โทร → สำเร็จ")
    void tc006() {
        assertSuccess(login("081-000-3333", "customer1234"));
        verify(userRepository).findByPhoneNumber("081-000-3333");
    }

    @Test
    @DisplayName("UT27-TC007 [R4] identifier มีช่องว่าง → trim แล้วสำเร็จ")
    void tc007() {
        assertSuccess(login("  customer@test.com  ", "customer1234"));
        verify(userRepository).findByEmail("customer@test.com");
    }
}
