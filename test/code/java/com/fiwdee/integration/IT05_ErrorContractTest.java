package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/** IT05 – รูปแบบ error ของ API: Bean Validation + GlobalExceptionHandler (Weak Robust EC) */
@DisplayName("IT05 API error contract – EC")
class IT05_ErrorContractTest extends IntegrationTestBase {

    private void assertError(Res res, int status) {
        assertThat(res.status()).as(res.toString()).isEqualTo(status);
        assertThat(res.read("$.success")).isEqualTo(false);
        assertThat(res.str("$.message")).isNotBlank();
    }

    @Test
    @DisplayName("IT05-TC001 (I1) body ขาด field บังคับ → 400 + errors ราย field")
    void tc001() throws Exception {
        Res res = POST("/api/bookings", registerCustomer().token(), "{}");
        assertError(res, 400);
        assertThat(res.str("$.message")).isEqualTo("Validation failed");
        assertThat(res.has("$.errors.serviceId")).isTrue();
        assertThat(res.has("$.errors.durationOptionId")).isTrue();
        assertThat(res.has("$.errors.startDateTime")).isTrue();
    }

    @Test
    @DisplayName("IT05-TC002 (I2) JSON ผิดรูป → 400")
    void tc002() throws Exception {
        Res res = POST("/api/bookings", registerCustomer().token(), "{bad json");
        assertError(res, 400);
        assertThat(res.str("$.message")).startsWith("Invalid request body");
    }

    @Test
    @DisplayName("IT05-TC003 (I3) enum ใน body ผิด (BITCOIN) → 400")
    void tc003() throws Exception {
        assertError(POST("/api/bookings/999999/payment", receptionist(), "{\"paymentMethod\":\"BITCOIN\"}"), 400);
    }

    @Test
    @DisplayName("IT05-TC004 (I4) ไม่ส่ง serviceId → 400")
    void tc004() throws Exception {
        Res res = GET("/api/bookings/availability", null);
        assertError(res, 400);
        assertThat(res.str("$.message")).isEqualTo("Required query parameter 'serviceId' is missing");
    }

    @Test
    @DisplayName("IT05-TC005 (I5) ไม่พบ booking → 404")
    void tc005() throws Exception {
        assertError(GET("/api/bookings/999999", registerCustomer().token()), 404);
    }

    @Test
    @DisplayName("IT05-TC006 (I6) overallRating = 6 → 400 errors.overallRating")
    void tc006() throws Exception {
        Res res = POST("/api/bookings/999999/review", registerCustomer().token(),
                "{\"overallRating\":6,\"therapistRating\":5,\"cleanlinessRating\":5}");
        assertError(res, 400);
        assertThat(res.str("$.errors.overallRating")).isEqualTo("Overall rating must be between 1 and 5");
    }

    @Test
    @DisplayName("IT05-TC007 (I7) status=FOO → 400 [DEF-019]")
    void tc007() throws Exception {
        assertError(PATCH("/api/bookings/999999/status?status=FOO", receptionist(), null), 400);
    }

    @Test
    @DisplayName("IT05-TC008 (I7) date=2026-13-45 → 400 [DEF-019]")
    void tc008() throws Exception {
        assertError(GET("/api/admin/bookings?date=2026-13-45", receptionist()), 400);
    }

    @Test
    @DisplayName("IT05-TC009 (I8) endpoint ไม่มีจริง → 404")
    void tc009() throws Exception {
        assertError(GET("/api/nope", registerCustomer().token()), 404);
    }

    @Test
    @DisplayName("IT05-TC010 (I9) ชำระซ้ำ → 409")
    void tc010() throws Exception {
        Account c = registerCustomer();
        Booking b = booking(c.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);
        String body = "{\"paymentMethod\":\"CASH\"}";
        assertThat(POST("/api/bookings/" + b.getId() + "/payment", receptionist(), body).status()).isEqualTo(200);

        Res second = POST("/api/bookings/" + b.getId() + "/payment", receptionist(), body);

        assertError(second, 409);
        assertThat(second.str("$.message")).contains("already been completed");
    }
}
