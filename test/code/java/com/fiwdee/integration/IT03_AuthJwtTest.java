package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.config.JwtTokenProvider;
import com.fiwdee.domain.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;

/** IT03 – AuthController + JwtAuthenticationFilter + UserRepository (Weak Robust EC) */
@DisplayName("IT03 Authentication & JWT filter – EC")
class IT03_AuthJwtTest extends IntegrationTestBase {

    @Value("${fiwdee.jwt.secret}")
    private String jwtSecret;

    private void assertUnauthorized(Res res) {
        assertThat(res.status()).isEqualTo(401);
        assertThat(res.read("$.success")).isEqualTo(false);
    }

    @Test
    @DisplayName("IT03-TC001 (V1) สมัครแล้วใช้ token เรียก /me ได้ทันที")
    void tc001() throws Exception {
        Account c = registerCustomer();

        Res me = GET("/api/auth/me", c.token());

        assertThat(me.status()).isEqualTo(200);
        assertThat(me.str("$.data.role")).isEqualTo("CUSTOMER");
        assertThat(me.str("$.data.email")).isEqualTo(c.email());
    }

    @Test
    @DisplayName("IT03-TC002 (V2) login owner แล้วเรียก endpoint ของ OWNER ได้")
    void tc002() throws Exception {
        Res login = POST("/api/auth/login", null, "{\"identifier\":\"owner\",\"password\":\"pass123\"}");
        assertThat(login.status()).isEqualTo(200);
        assertThat(login.str("$.data.role")).isEqualTo("OWNER");

        assertThat(GET("/api/admin/users", login.str("$.data.token")).status()).isEqualTo(200);
    }

    @Test
    @DisplayName("IT03-TC003 (I1) รหัสผ่านผิด → 401 JSON")
    void tc003() throws Exception {
        Res res = POST("/api/auth/login", null, "{\"identifier\":\"owner\",\"password\":\"wrong\"}");
        assertUnauthorized(res);
        assertThat(res.str("$.message")).isEqualTo("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }

    @Test
    @DisplayName("IT03-TC004 (I2) ไม่มี token → 401 JSON")
    void tc004() throws Exception {
        Res res = GET("/api/auth/me", null);
        assertUnauthorized(res);
        assertThat(res.str("$.message")).startsWith("Authentication required");
    }

    @Test
    @DisplayName("IT03-TC005 (I3) token ผิดรูป → 401")
    void tc005() throws Exception {
        assertUnauthorized(GET("/api/auth/me", "abc"));
    }

    @Test
    @DisplayName("IT03-TC006 (I4) token หมดอายุ → 401")
    void tc006() throws Exception {
        Account c = registerCustomer();
        User user = userRepository.findByUsername(c.email()).orElseThrow();
        String expired = new JwtTokenProvider(jwtSecret, -1000L).generateToken(user);

        assertUnauthorized(GET("/api/auth/me", expired));
    }

    @Test
    @DisplayName("IT03-TC007 (I5) token จาก secret อื่น → 401")
    void tc007() throws Exception {
        Account c = registerCustomer();
        User user = userRepository.findByUsername(c.email()).orElseThrow();
        String foreign = new JwtTokenProvider("another-secret-key-that-is-long-enough-0123456789", 86_400_000L)
                .generateToken(user);

        assertUnauthorized(GET("/api/auth/me", foreign));
    }

    @Test
    @DisplayName("IT03-TC008 (I6) ผู้ใช้ถูกระงับหลังได้ token → 401")
    void tc008() throws Exception {
        Account c = registerCustomer();
        assertThat(GET("/api/auth/me", c.token()).status()).isEqualTo(200);

        jdbc.update("UPDATE users SET is_active = false WHERE id = ?", c.id());

        assertUnauthorized(GET("/api/auth/me", c.token()));
    }

    @Test
    @DisplayName("IT03-TC009 (V3) PUT /me แก้โปรไฟล์ → บันทึกลงฐานข้อมูลและ /me แสดงค่าใหม่")
    void tc009() throws Exception {
        Account c = registerCustomer();

        Res res = PUT("/api/auth/me", c.token(), """
                {"fullName":"ชื่อใหม่ ทดสอบ","email":"%s","phoneNumber":"%s","healthNotes":"ปวดหลัง"}
                """.formatted(c.email(), c.phone()));

        assertThat(res.status()).isEqualTo(200);
        assertThat(jdbc.queryForObject("SELECT full_name FROM users WHERE id = ?", String.class, c.id()))
                .isEqualTo("ชื่อใหม่ ทดสอบ");
        assertThat(jdbc.queryForObject("SELECT health_notes FROM customers WHERE id = ?", String.class, c.id()))
                .isEqualTo("ปวดหลัง");
        Res me = GET("/api/auth/me", c.token());
        assertThat(me.str("$.data.name")).isEqualTo("ชื่อใหม่ ทดสอบ");
    }

    @Test
    @DisplayName("IT03-TC010 (I7) สมัครด้วยอีเมลที่มีแล้ว → 409")
    void tc010() throws Exception {
        Account c = registerCustomer();
        Res res = POST("/api/auth/register", null, """
                {"fullName":"ซ้ำ","email":"%s","phoneNumber":"0899999999","password":"password123"}
                """.formatted(c.email()));
        assertThat(res.status()).isEqualTo(409);
        assertThat(res.read("$.success")).isEqualTo(false);
    }

    @Test
    @DisplayName("IT03-TC011 (I8) ข้อมูลสมัครไม่ผ่าน @Valid → 400 พร้อม errors")
    void tc011() throws Exception {
        Res res = POST("/api/auth/register", null,
                "{\"fullName\":\"x\",\"email\":\"abc\",\"phoneNumber\":\"0800000000\",\"password\":\"123\"}");
        assertThat(res.status()).isEqualTo(400);
        assertThat(res.str("$.message")).isEqualTo("Validation failed");
        assertThat(res.has("$.errors.email")).isTrue();
        assertThat(res.has("$.errors.password")).isTrue();
    }

    @Test
    @DisplayName("IT03-TC012 (V4) login สำเร็จแล้ว last_login_at ถูกบันทึก")
    void tc012() throws Exception {
        jdbc.update("UPDATE users SET last_login_at = NULL WHERE username = 'owner'");

        login("owner", STAFF_PASSWORD);

        assertThat(rows("SELECT COUNT(*) FROM users WHERE username = 'owner' AND last_login_at IS NOT NULL")).isEqualTo(1);
    }
}
