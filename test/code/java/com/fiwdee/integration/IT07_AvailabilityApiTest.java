package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.enums.BookingStatus;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * IT07 – GET /api/bookings/availability กับข้อมูลจริงในฐานข้อมูล (BVA ของจำนวนทรัพยากรที่เหลือและเวลาปิด)
 * THAI: หมอนวด 4 คน (1, 2, 4, 6) • ห้อง SINGLE 2 ห้อง • ร้านเปิด 10:00–22:00
 */
@DisplayName("IT07 Availability API vs database – BVA")
class IT07_AvailabilityApiTest extends IntegrationTestBase {

    private Account customer;

    @BeforeEach
    void customer() throws Exception {
        customer = registerCustomer();
    }

    private Res availability(int minutes) throws Exception {
        Res res = GET(availabilityUrl(D, "THAI", minutes), null);
        assertThat(res.status()).as(res.toString()).isEqualTo(200);
        return res;
    }

    private void closeDay(String extraSet) {
        jdbc.update("UPDATE business_hours SET " + extraSet + " WHERE day_of_week = ?", D.getDayOfWeek().name());
    }

    @Test
    @DisplayName("IT07-TC001 ไม่มีการจอง → 12 รอบ ว่างทุกรอบ (ห้อง 2 หมอนวด 4)")
    void tc001() throws Exception {
        List<Map<String, Object>> slots = availability(60).list("$.data.availableSlots");

        assertThat(slots).hasSize(12);
        assertThat(slots.get(0).get("time")).isEqualTo("10:00");
        assertThat(slots.get(11).get("time")).isEqualTo("21:00");
        assertThat(slots).allSatisfy(s -> {
            assertThat(s.get("available")).isEqualTo(true);
            assertThat(count(s, "availableRooms")).isEqualTo(2);
            assertThat(count(s, "availableTherapists")).isEqualTo(4);
        });
    }

    @Test
    @DisplayName("IT07-TC002 จองไป 1 ห้อง 1 คน → รอบ 11:00 เหลือห้อง 1 หมอนวด 3")
    void tc002() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Map<String, Object> s = slot(availability(60), "11:00");

        assertThat(s.get("available")).isEqualTo(true);
        assertThat(count(s, "availableRooms")).isEqualTo(1);
        assertThat(count(s, "availableTherapists")).isEqualTo(3);
    }

    @Test
    @DisplayName("IT07-TC003 ห้อง SINGLE ถูกจองครบ 2 ห้อง → รอบ 11:00 ไม่ว่าง")
    void tc003() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);
        booking(customer.id(), 2, "Room 2", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Map<String, Object> s = slot(availability(60), "11:00");

        assertThat(s.get("available")).isEqualTo(false);
        assertThat(count(s, "availableRooms")).isZero();
    }

    @Test
    @DisplayName("IT07-TC004 buffer 15 นาทีทำให้รอบ 10:00 และ 12:00 ไม่ว่างด้วย แต่ 13:00 ว่าง")
    void tc004() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);
        booking(customer.id(), 2, "Room 2", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = availability(60);

        assertThat(slot(res, "10:00").get("available")).isEqualTo(false);
        assertThat(slot(res, "12:00").get("available")).isEqualTo(false);
        assertThat(slot(res, "13:00").get("available")).isEqualTo(true);
    }

    @Test
    @DisplayName("IT07-TC005 การจองที่ถูกยกเลิกไม่ล็อกรอบ")
    void tc005() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CANCELLED);
        booking(customer.id(), 2, "Room 2", "THAI", 60, D.atTime(11, 0), BookingStatus.CANCELLED);

        assertThat(slot(availability(60), "11:00").get("available")).isEqualTo(true);
    }

    @Test
    @DisplayName("IT07-TC006 หมอนวด THAI ทั้ง 4 คนติดงาน 15:00 → รอบ 15:00 ไม่ว่าง (ห้องยังเหลือ 2)")
    void tc006() throws Exception {
        booking(customer.id(), 1, "Room 3", "THAI", 60, D.atTime(15, 0), BookingStatus.CONFIRMED);
        booking(customer.id(), 2, "Room 4", "THAI", 60, D.atTime(15, 0), BookingStatus.CONFIRMED);
        booking(customer.id(), 4, "Room 5", "THAI", 60, D.atTime(15, 0), BookingStatus.CONFIRMED);
        booking(customer.id(), 6, "Room 6", "THAI", 60, D.atTime(15, 0), BookingStatus.CONFIRMED);

        Map<String, Object> s = slot(availability(60), "15:00");

        assertThat(s.get("available")).isEqualTo(false);
        assertThat(count(s, "availableTherapists")).isZero();
        assertThat(count(s, "availableRooms")).isEqualTo(2);
    }

    @Test
    @DisplayName("IT07-TC007 ร้านปิดวันนั้น → 0 รอบ")
    void tc007() throws Exception {
        closeDay("is_closed = true");

        assertThat(availability(60).list("$.data.availableSlots")).isEmpty();
    }

    @Test
    @DisplayName("IT07-TC008 ร้านปิด 12:00 → 2 รอบ (10:00, 11:00)")
    void tc008() throws Exception {
        closeDay("close_time = TIME '12:00'");

        assertThat(availability(60).list("$.data.availableSlots")).extracting(s -> s.get("time"))
                .containsExactly("10:00", "11:00");
    }

    @Test
    @DisplayName("IT07-TC009 durationMinutes = 90 → 11 รอบ (10:00–20:00)")
    void tc009() throws Exception {
        List<Map<String, Object>> slots = availability(90).list("$.data.availableSlots");

        assertThat(slots).hasSize(11);
        assertThat(slots.get(10).get("time")).isEqualTo("20:00");
    }

    @Test
    @DisplayName("IT07-TC010 บริการไม่มีจริง → 404 • บริการถูกปิด → 400")
    void tc010() throws Exception {
        assertThat(GET("/api/bookings/availability?date=" + D + "&serviceId=999999", null).status()).isEqualTo(404);

        jdbc.update("UPDATE services SET is_active = false WHERE service_code = 'AROMA'");
        assertThat(GET(availabilityUrl(D, "AROMA", 90), null).status()).isEqualTo(400);
    }
}
