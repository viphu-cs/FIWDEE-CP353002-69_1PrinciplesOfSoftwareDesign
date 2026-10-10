package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * IT12 – ตั้งค่าผ่าน API หลังบ้านแล้วตรวจว่าโมดูลจอง/ตรวจรอบว่างเห็นผลจริง (Weak Robust EC ข้ามโมดูล)
 */
@DisplayName("IT12 Admin configuration impact on booking – EC")
class IT12_AdminConfigImpactTest extends IntegrationTestBase {

    private Map<String, Object> slot10() throws Exception {
        return slot(GET(availabilityUrl(D, "THAI", 60), null), "10:00");
    }

    @Test
    @DisplayName("IT12-TC001 (V1) เพิ่มห้อง SINGLE → รอบว่างมีห้อง 3 ห้อง")
    void tc001() throws Exception {
        Res res = POST("/api/admin/rooms", owner(),
                "{\"roomNumber\":\"IT-R1\",\"roomType\":\"SINGLE\",\"capacity\":1,\"cleaningBufferMinutes\":15}");

        assertThat(res.status()).as(res.toString()).isEqualTo(201);
        assertThat(count(slot10(), "availableRooms")).isEqualTo(3);
    }

    @Test
    @DisplayName("IT12-TC002 (V1) ปิด Room 2 → รอบว่างเหลือเฉพาะ Room 1")
    void tc002() throws Exception {
        Res res = DELETE("/api/admin/rooms/" + room("Room 2").getId(), owner());

        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> rooms = (List<Map<String, Object>>) slot10().get("availableRooms");
        assertThat(rooms).extracting(r -> r.get("roomNumber")).containsExactly("Room 1");
    }

    @Test
    @DisplayName("IT12-TC003 (V2) เพิ่มบริการ IT-SPA → แสดงใน /api/services สาธารณะ")
    void tc003() throws Exception {
        Res res = POST("/api/admin/services", owner(), """
                {"serviceCode":"IT-SPA","serviceName":"IT Spa","description":"test","category":"Spa",
                 "requiredRoomType":"VIP","durationOptions":[{"durationMinutes":60,"price":1000}]}
                """);
        assertThat(res.status()).as(res.toString()).isEqualTo(201);

        Res list = GET("/api/services", null);

        assertThat(list.list("$.data")).anySatisfy(s -> {
            assertThat(s.get("serviceCode")).isEqualTo("IT-SPA");
            assertThat(s.get("durationOptions").toString()).contains("60");
        });
    }

    @Test
    @DisplayName("IT12-TC004 (V2) ปิดบริการ THAI → จองไม่ได้และไม่แสดงในรายการ")
    void tc004() throws Exception {
        assertThat(DELETE("/api/admin/services/" + service("THAI").getId(), owner()).status()).isEqualTo(200);

        Res booking = POST("/api/bookings", registerCustomer().token(),
                bookingJson(null, "THAI", 60, 1, "Room 1", D.atTime(11, 0)));
        assertThat(booking.status()).as(booking.toString()).isEqualTo(400);
        assertThat(booking.str("$.message")).isEqualTo("Selected service is inactive");
        assertThat(GET("/api/services", null).list("$.data")).noneSatisfy(s ->
                assertThat(s.get("serviceCode")).isEqualTo("THAI"));
    }

    @Test
    @DisplayName("IT12-TC005 (V3) ตั้ง therapist1 หยุดวัน D → จอง therapist1 วัน D ได้ 409")
    void tc005() throws Exception {
        Res res = PUT("/api/admin/therapists/" + therapist(1).getId() + "/schedules", owner(),
                "{\"scheduleDate\":\"" + D + "\",\"dayOff\":true,\"leaveReason\":\"ลาพักร้อน\",\"shifts\":[]}");
        assertThat(res.status()).as(res.toString()).isEqualTo(200);

        Res booking = POST("/api/bookings", registerCustomer().token(),
                bookingJson(null, "THAI", 60, 1, "Room 1", D.atTime(11, 0)));

        assertThat(booking.status()).as(booking.toString()).isEqualTo(409);
        assertThat(booking.str("$.message")).contains("is off on this date");
    }

    @Test
    @DisplayName("IT12-TC006 (V4) ปิดร้านวันของ D ผ่าน PUT /api/admin/shop → รอบว่าง 0 รอบ")
    void tc006() throws Exception {
        List<String> days = new ArrayList<>();
        for (DayOfWeek d : DayOfWeek.values()) {
            boolean closed = d == D.getDayOfWeek();
            days.add("{\"dayOfWeek\":\"" + d.name() + "\",\"openTime\":\"10:00\",\"closeTime\":\"22:00\",\"closed\":"
                    + closed + "}");
        }
        Res res = PUT("/api/admin/shop", owner(), """
                {"shopName":"FIWDEE Massage","address":"Khon Kaen, Thailand","phoneNumber":"043000001",
                 "description":"Massage and wellness shop","businessHours":[%s]}
                """.formatted(String.join(",", days)));
        assertThat(res.status()).as(res.toString()).isEqualTo(200);

        assertThat(GET(availabilityUrl(D, "THAI", 60), null).list("$.data.availableSlots")).isEmpty();
    }

    @Test
    @Tag("known-defect")
    @DisplayName("IT12-TC007 (I1) หมอนวดที่สร้างผ่านหลังบ้านต้อง login ได้ [DEF-011]")
    void tc007() throws Exception {
        String phone = "07" + String.format("%08d", ThreadLocalRandom.current().nextInt(100_000_000));
        Res res = POST("/api/admin/therapists", owner(), """
                {"username":"it.newtherapist","fullName":"New Therapist","email":"it.newtherapist@test.com",
                 "phoneNumber":"%s","nickname":"New","bio":"test","commissionRate":10,"serviceIds":[%d],
                 "password":"therapist1234"}
                """.formatted(phone, service("THAI").getId()));
        assertThat(res.status()).as(res.toString()).isEqualTo(201);

        Res login = POST("/api/auth/login", null, "{\"identifier\":\"it.newtherapist\",\"password\":\"therapist1234\"}");

        assertThat(login.status()).as("หมอนวดใหม่ต้อง login ได้ " + login).isEqualTo(200);
        assertThat(login.str("$.data.role")).isEqualTo("THERAPIST");
    }

    @Test
    @Tag("known-defect")
    @DisplayName("IT12-TC008 (I2) receptionist เพิ่มห้องไม่ได้ (UC-24 เป็นสิทธิ์ Owner) → 403 [DEF-015]")
    void tc008() throws Exception {
        Res res = POST("/api/admin/rooms", receptionist(),
                "{\"roomNumber\":\"IT-R2\",\"roomType\":\"SINGLE\",\"capacity\":1,\"cleaningBufferMinutes\":15}");

        assertThat(res.status()).as(res.toString()).isEqualTo(403);
    }
}
