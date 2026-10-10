package com.fiwdee.config;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.entity.Customer;
import com.fiwdee.testsupport.TestData;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** UT31 – JwtTokenProvider (Weak Robust EC) • ใช้ object จริง ไม่ต้อง mock */
@DisplayName("UT31 JwtTokenProvider – EC")
class UT31_JwtTokenProviderTest {

    private static final String SECRET = "fiwdee-unit-test-secret-key-0123456789-abcdef";
    private static final String OTHER_SECRET = "another-secret-key-that-is-long-enough-987654321";

    private final JwtTokenProvider provider = new JwtTokenProvider(SECRET, 86_400_000L);
    private final Customer customer = TestData.customer(1);

    @Test
    @DisplayName("UT31-TC001 (V1) token ที่ระบบออกให้ → validateToken = true")
    void tc001() {
        assertThat(provider.validateToken(provider.generateToken(customer))).isTrue();
    }

    @Test
    @DisplayName("UT31-TC002 (V1) getUsernameFromToken = user.getUsername()")
    void tc002() {
        assertThat(provider.getUsernameFromToken(provider.generateToken(customer))).isEqualTo(customer.getUsername());
    }

    @Test
    @DisplayName("UT31-TC003 (I1) token หมดอายุ (expiration-ms = -1000) → false ไม่โยน Exception")
    void tc003() {
        String expired = new JwtTokenProvider(SECRET, -1000L).generateToken(customer);
        assertThat(provider.validateToken(expired)).isFalse();
    }

    @Test
    @DisplayName("UT31-TC004 (I2) payload ถูกแก้ (เปลี่ยน subject) → false")
    void tc004() {
        String[] parts = provider.generateToken(customer).split("\\.");
        Base64.Decoder dec = Base64.getUrlDecoder();
        Base64.Encoder enc = Base64.getUrlEncoder().withoutPadding();
        String payload = new String(dec.decode(parts[1]), StandardCharsets.UTF_8)
                .replace(customer.getUsername(), "owner1");
        String tampered = parts[0] + "." + enc.encodeToString(payload.getBytes(StandardCharsets.UTF_8)) + "." + parts[2];

        assertThat(tampered).isNotEqualTo(String.join(".", parts));
        assertThat(provider.validateToken(tampered)).isFalse();
    }

    @Test
    @DisplayName("UT31-TC005 (I3) token เซ็นด้วย secret อื่น → false")
    void tc005() {
        String foreign = new JwtTokenProvider(OTHER_SECRET, 86_400_000L).generateToken(customer);
        assertThat(provider.validateToken(foreign)).isFalse();
    }

    @Test
    @DisplayName("UT31-TC006 (I4) รูปแบบผิด \"abc\" → false")
    void tc006() {
        assertThat(provider.validateToken("abc")).isFalse();
    }

    @Test
    @DisplayName("UT31-TC007 (I5) null และ \"\" → false")
    void tc007() {
        assertThat(provider.validateToken(null)).isFalse();
        assertThat(provider.validateToken("")).isFalse();
    }
}
