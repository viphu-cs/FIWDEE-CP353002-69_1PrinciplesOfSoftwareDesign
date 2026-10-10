package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

/**
 * IT04 – สิทธิ์ตาม role (Decision Table แบบ Extended Entry: rule = role, action = ผลต่อแต่ละ endpoint)
 * ใช้ id 999999 ที่ไม่มีจริง: ถ้าผ่าน security จะได้ 404 จาก service จึงแยกผลของ security ออกมาได้ชัด
 */
@DisplayName("IT04 Role-based access – Decision Table")
class IT04_RoleAccessTest extends IntegrationTestBase {

    private static final String[] ROLES = {"ANON", "CUSTOMER", "THERAPIST", "RECEPTIONIST", "OWNER"};

    /** {endpoint id, method, url, body, expected per role} – ลำดับตรงกับชีต IT04 */
    private static final Object[][] MATRIX = {
        {"E1", "GET", "/api/services", null, new String[] {"PASS", "PASS", "PASS", "PASS", "PASS"}},
        {"E2", "GET", "/api/bookings/my", null, new String[] {"401", "PASS", "PASS", "PASS", "PASS"}},
        {"E3", "GET", "/api/admin/rooms", null, new String[] {"401", "403", "403", "PASS", "PASS"}},
        {"E4", "GET", "/api/admin/users", null, new String[] {"401", "403", "403", "403", "PASS"}},
        {"E5", "GET", "/api/admin/reports/revenue", null, new String[] {"401", "403", "403", "403", "PASS"}},
        {"E6", "PATCH", "/api/bookings/999999/status?status=CONFIRMED", null, new String[] {"401", "403", "403", "PASS", "PASS"}},
        {"E7", "POST", "/api/payments/999999/refund", "{\"refundAmount\":10,\"reason\":\"test\"}",
            new String[] {"401", "403", "403", "PASS", "PASS"}},
        {"E8", "GET", "/api/admin/queue", null, new String[] {"401", "403", "403", "PASS", "PASS"}},
        {"E9", "PATCH", "/api/bookings/999999/check-in", null, new String[] {"401", "403!", "403!", "PASS", "PASS"}},
        {"E10", "POST", "/api/therapist/queue/999999/start?therapistId=1", null,
            new String[] {"401", "403!", "PASS", "PASS", "PASS"}},
    };

    /** แถวทั้งหมดของตาราง • knownDefect = true คือช่องที่มี ⚠ (ค่าตาม Use-case Matrix ที่ยังไม่ถูกบังคับ → DEF-015) */
    private static Stream<Arguments> cells(boolean knownDefect) {
        List<Arguments> out = new ArrayList<>();
        for (int i = 0; i < MATRIX.length; i++) {
            Object[] row = MATRIX[i];
            String[] expected = (String[]) row[4];
            for (int k = 0; k < ROLES.length; k++) {
                boolean defect = expected[k].endsWith("!");
                if (defect != knownDefect) {
                    continue;
                }
                String tc = String.format("IT04-TC%03d", i * ROLES.length + k + 1);
                out.add(Arguments.of(tc, row[0], row[1], row[2], row[3], ROLES[k], expected[k].replace("!", "")));
            }
        }
        return out.stream();
    }

    static Stream<Arguments> expectedByDesign() {
        return cells(false);
    }

    static Stream<Arguments> knownDefectCells() {
        return cells(true);
    }

    @ParameterizedTest(name = "{0} {1} {2} {3} as {5} → {6}")
    @MethodSource("expectedByDesign")
    void access(String tc, String eid, String method, String url, String body, String role, String expected)
            throws Exception {
        check(tc, method, url, body, role, expected);
    }

    @ParameterizedTest(name = "{0} [DEF-015] {1} {2} {3} as {5} → {6}")
    @MethodSource("knownDefectCells")
    void accessExpectedByUseCaseMatrix(String tc, String eid, String method, String url, String body, String role,
                                       String expected) throws Exception {
        check(tc, method, url, body, role, expected);
    }

    private void check(String tc, String method, String url, String body, String role, String expected) throws Exception {
        String token = tokenFor(role);
        Res res = switch (method) {
            case "GET" -> GET(url, token);
            case "POST" -> POST(url, token, body);
            case "PATCH" -> PATCH(url, token, body);
            default -> throw new IllegalArgumentException(method);
        };

        if (expected.equals("PASS")) {
            assertThat(res.status()).as(tc + " " + res).isNotIn(401, 403);
        } else {
            assertThat(res.status()).as(tc + " " + res).isEqualTo(Integer.parseInt(expected));
            assertThat(res.read("$.success")).isEqualTo(false);
        }
    }

    private String tokenFor(String role) throws Exception {
        return switch (role) {
            case "ANON" -> null;
            case "CUSTOMER" -> registerCustomer().token();
            case "THERAPIST" -> therapistToken(1);
            case "RECEPTIONIST" -> receptionist();
            default -> owner();
        };
    }
}
