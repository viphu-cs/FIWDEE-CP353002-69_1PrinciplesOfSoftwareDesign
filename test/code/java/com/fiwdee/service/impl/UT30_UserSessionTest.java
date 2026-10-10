package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mockStatic;

import java.time.LocalDateTime;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.MockedStatic;

/**
 * UT30 – UserSessionServiceImpl (หน้าต่างออนไลน์ 15 นาที) • Robustness BVA ขอบด้านเดียว ความละเอียดระดับวินาที
 * ตรึง LocalDateTime.now() ด้วย mockStatic แล้วเลื่อนเวลาตามเคส
 */
@DisplayName("UT30 UserSession – 15-minute window BVA")
class UT30_UserSessionTest {

    private static final LocalDateTime T0 = LocalDateTime.of(2026, 11, 2, 10, 0, 0);
    private static final long USER = 1L;

    private UserSessionServiceImpl sessions;
    private MockedStatic<LocalDateTime> time;

    @BeforeEach
    void setUp() {
        sessions = new UserSessionServiceImpl(15);
        time = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
        at(T0);
    }

    @AfterEach
    void tearDown() {
        time.close();
    }

    private void at(LocalDateTime now) {
        time.when(LocalDateTime::now).thenReturn(now);
    }

    @ParameterizedTest(name = "{0} หลัง touch {1}:{2} → online={3}")
    @CsvSource({
        "UT30-TC001,  0,  0, true",
        "UT30-TC002,  5,  0, true",
        "UT30-TC003, 14, 59, true",
        "UT30-TC004, 15,  0, false",
        "UT30-TC005, 15,  1, false"
    })
    void window(String tc, int minutes, int seconds, boolean online) {
        sessions.touch(USER);

        at(T0.plusMinutes(minutes).plusSeconds(seconds));

        assertThat(sessions.isOnline(USER)).as(tc).isEqualTo(online);
        assertThat(sessions.getSessionStart(USER)).as(tc).isEqualTo(online ? T0 : null);
    }

    @Test
    @DisplayName("UT30-TC006 ไม่เคย touch → isOnline = false")
    void tc006() {
        assertThat(sessions.isOnline(USER)).isFalse();
        assertThat(sessions.getSessionStart(USER)).isNull();
    }

    @Test
    @DisplayName("UT30-TC007 touch แล้ว endSession (2:00) → isOnline = false")
    void tc007() {
        sessions.touch(USER);
        at(T0.plusMinutes(2));
        sessions.endSession(USER);
        assertThat(sessions.isOnline(USER)).isFalse();
    }

    @Test
    @DisplayName("UT30-TC008 touch ใหม่หลังหมดอายุ (20:00) → online และเริ่ม session ใหม่")
    void tc008() {
        sessions.touch(USER);
        LocalDateTime later = T0.plusMinutes(20);
        at(later);

        sessions.touch(USER);

        assertThat(sessions.isOnline(USER)).isTrue();
        assertThat(sessions.getSessionStart(USER)).isEqualTo(later);
    }
}
