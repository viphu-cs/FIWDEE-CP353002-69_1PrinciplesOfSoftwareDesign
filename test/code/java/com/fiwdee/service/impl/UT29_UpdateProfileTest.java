package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.Receptionist;
import com.fiwdee.domain.entity.User;
import com.fiwdee.dto.request.UpdateProfileRequestDTO;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.mapper.UserMapper;
import com.fiwdee.repository.UserRepository;
import com.fiwdee.service.UserSessionService;
import com.fiwdee.testsupport.TestData;
import java.util.List;
import java.util.Objects;
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
import org.springframework.security.crypto.password.PasswordEncoder;

/** UT29 – UserServiceImpl.updateProfile (Decision Table, Limited Entry: R1–R7) */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT29 UserService.updateProfile – Decision Table")
class UT29_UpdateProfileTest {

    @Mock UserRepository userRepository;
    @Mock UserSessionService userSessionService;
    @Mock UserMapper userMapper;
    @Mock PasswordEncoder passwordEncoder;
    @InjectMocks UserServiceImpl userService;

    private Customer customer;        // user#1
    private Receptionist reception;   // user#50
    private User owner;               // user#60

    @BeforeEach
    void world() {
        customer = TestData.customer(1);
        customer.setEmail("customer@test.com");
        customer.setPhoneNumber("081-000-3333");
        customer.setPasswordHash("$2a$old");
        reception = TestData.receptionist(50);
        reception.setEmail("reception@fiwdee.com");
        reception.setPhoneNumber("081-000-5050");
        owner = TestData.owner(60);
        owner.setEmail("owner@fiwdee.com");
        owner.setPhoneNumber("081-000-6060");
        List<User> all = List.of(customer, reception, owner);

        when(userRepository.findById(anyLong())).thenAnswer(i ->
                all.stream().filter(u -> u.getId().equals(i.getArgument(0))).findFirst());
        when(userRepository.findByEmailAndIdNot(anyString(), anyLong())).thenAnswer(i ->
                all.stream().filter(u -> Objects.equals(u.getEmail(), i.getArgument(0))
                        && !u.getId().equals(i.getArgument(1))).findFirst());
        when(userRepository.findByPhoneNumberAndIdNot(anyString(), anyLong())).thenAnswer(i ->
                all.stream().filter(u -> Objects.equals(u.getPhoneNumber(), i.getArgument(0))
                        && !u.getId().equals(i.getArgument(1))).findFirst());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(passwordEncoder.matches("customer1234", "$2a$old")).thenReturn(true);
        when(passwordEncoder.encode("newpass123")).thenReturn("$2a$new");
    }

    /** request ของ customer#1 ที่ไม่เปลี่ยนอะไร (อีเมล/เบอร์เดิม) */
    private UpdateProfileRequestDTO.UpdateProfileRequestDTOBuilder base() {
        return UpdateProfileRequestDTO.builder()
                .fullName("ลูกค้า 1").email("customer@test.com").phoneNumber("081-000-3333");
    }

    @Test
    @DisplayName("UT29-TC001 [R1] ไม่พบผู้ใช้ → NotFoundException")
    void tc001() {
        assertThrows(NotFoundException.class, () -> userService.updateProfile(999L, base().build()));
    }

    @Test
    @DisplayName("UT29-TC002 [R2] อีเมลซ้ำกับ user#60 → ConflictException • ไม่ save")
    void tc002() {
        ConflictException ex = assertThrows(ConflictException.class,
                () -> userService.updateProfile(1L, base().email("owner@fiwdee.com").build()));
        assertThat(ex.getMessage()).startsWith("อีเมลนี้ถูกใช้งานแล้ว");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT29-TC003 [R3] เบอร์ซ้ำกับ user#50 → ConflictException")
    void tc003() {
        ConflictException ex = assertThrows(ConflictException.class,
                () -> userService.updateProfile(1L, base().phoneNumber("081-000-5050").build()));
        assertThat(ex.getMessage()).startsWith("เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว");
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT29-TC004 [R4] newPassword + currentPassword ผิด → ValidationException")
    void tc004() {
        ValidationException ex = assertThrows(ValidationException.class, () -> userService.updateProfile(1L,
                base().newPassword("newpass123").currentPassword("wrong").build()));
        assertThat(ex.getMessage()).isEqualTo("รหัสผ่านปัจจุบันไม่ถูกต้อง");
        assertThat(customer.getPasswordHash()).isEqualTo("$2a$old");
    }

    @Test
    @DisplayName("UT29-TC005 [R4] newPassword + currentPassword ว่าง → ValidationException")
    void tc005() {
        assertThrows(ValidationException.class, () -> userService.updateProfile(1L,
                base().newPassword("newpass123").currentPassword("").build()));
        assertThat(customer.getPasswordHash()).isEqualTo("$2a$old");
    }

    @Test
    @DisplayName("UT29-TC006 [R5] currentPassword ถูก → passwordHash = encode(newpass123) • save")
    void tc006() {
        userService.updateProfile(1L, base().newPassword("newpass123").currentPassword("customer1234").build());
        assertThat(customer.getPasswordHash()).isEqualTo("$2a$new");
        verify(userRepository).save(customer);
    }

    @Test
    @DisplayName("UT29-TC007 [R6] Customer ไม่ส่ง newPassword → hash ไม่เปลี่ยน, บันทึก healthNotes")
    void tc007() {
        userService.updateProfile(1L, base().healthNotes("ความดันสูง").preferredPressure("MEDIUM").build());
        assertThat(customer.getPasswordHash()).isEqualTo("$2a$old");
        assertThat(customer.getHealthNotes()).isEqualTo("ความดันสูง");
        assertThat(customer.getPreferredPressure()).isEqualTo("MEDIUM");
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    @DisplayName("UT29-TC008 [R7] Receptionist → fullName ถูก trim, ไม่มี field ลูกค้า")
    void tc008() {
        userService.updateProfile(50L, UpdateProfileRequestDTO.builder()
                .fullName("  สมใจ  ").email("reception@fiwdee.com").phoneNumber("081-000-5050")
                .healthNotes("ไม่ควรถูกเก็บ").build());
        assertThat(reception.getFullName()).isEqualTo("สมใจ");
        assertThat(reception).isNotInstanceOf(Customer.class);
        verify(userRepository).save(reception);
    }
}
