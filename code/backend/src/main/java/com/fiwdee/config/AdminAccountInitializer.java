package com.fiwdee.config;

import com.fiwdee.domain.entity.Owner;
import com.fiwdee.domain.entity.Receptionist;
import com.fiwdee.domain.enums.UserRole;
import com.fiwdee.repository.OwnerRepository;
import com.fiwdee.repository.ReceptionistRepository;
import com.fiwdee.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Dev 1 bootstrap: guarantees the two back-office demo accounts exist so that
 * Admin Portal login (#admin) is testable before Dev 2's full DataSeeder (Task 1.7) lands.
 * Idempotent — skips accounts that already exist, so it is safe to run alongside
 * the DataSeeder as long as the seeder checks existsByEmail() the same way.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminAccountInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final OwnerRepository ownerRepository;
    private final ReceptionistRepository receptionistRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${fiwdee.seed-admin-accounts:true}")
    private boolean seedAdminAccounts;

    @Override
    public void run(String... args) {
        if (!seedAdminAccounts) {
            return;
        }

        if (!userRepository.existsByEmail("owner@fiwdee-massage.co.th")) {
            Owner owner = Owner.builder()
                    .username("owner@fiwdee-massage.co.th")
                    .fullName("สมชาย สุขสบาย")
                    .email("owner@fiwdee-massage.co.th")
                    .phoneNumber("081-000-1111")
                    .passwordHash(passwordEncoder.encode("admin1234"))
                    .role(UserRole.OWNER)
                    .build();
            ownerRepository.save(owner);
            log.info("Seeded demo OWNER account: owner@fiwdee-massage.co.th (password: admin1234)");
        }

        if (!userRepository.existsByEmail("reception@fiwdee-massage.co.th")) {
            Receptionist receptionist = Receptionist.builder()
                    .username("reception@fiwdee-massage.co.th")
                    .fullName("วิภาวรรณ ต้อนรับ")
                    .email("reception@fiwdee-massage.co.th")
                    .phoneNumber("081-000-2222")
                    .passwordHash(passwordEncoder.encode("recep1234"))
                    .role(UserRole.RECEPTIONIST)
                    .staffCode("RCPT-001")
                    .build();
            receptionistRepository.save(receptionist);
            log.info("Seeded demo RECEPTIONIST account: reception@fiwdee-massage.co.th (password: recep1234)");
        }
    }
}
