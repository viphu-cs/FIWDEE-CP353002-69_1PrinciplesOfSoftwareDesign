package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.RoomType;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * IT06 – POST /api/bookings ผ่านทุกชั้นจนถึง PostgreSQL (Decision Table)
 * D = วันนี้ + 7 วัน • THAI 60 นาที = 500.00 ใช้ห้อง SINGLE
 */
@DisplayName("IT06 Create booking API – Decision Table")
class IT06_CreateBookingApiTest extends IntegrationTestBase {

    private Account customer;

    @BeforeEach
    void customer() throws Exception {
        customer = registerCustomer();
    }

    private Res book(String token, String body) throws Exception {
        return POST("/api/bookings", token, body);
    }

    @Test
    @DisplayName("IT06-TC001 [R1] ลูกค้าจองเอง → 201 PENDING / ONLINE และบันทึกลงฐานข้อมูล")
    void tc001() throws Exception {
        Res res = book(customer.token(), bookingJson(null, "THAI", 60, 1, "Room 1", D.atTime(11, 0)));

        assertThat(res.status()).as(res.toString()).isEqualTo(201);
        assertThat(res.str("$.data.status")).isEqualTo("PENDING");
        assertThat(res.str("$.data.bookingChannel")).isEqualTo("ONLINE");
        assertThat(res.dec("$.data.totalPrice")).isEqualByComparingTo("500.00");
        assertThat(res.str("$.data.endDateTime")).startsWith(D + "T12:00");
        long id = res.id("$.data.id");
        assertThat(rows("SELECT COUNT(*) FROM bookings WHERE id = ? AND customer_id = ? AND status = 'PENDING'",
                id, customer.id())).isEqualTo(1);
    }

    @Test
    @DisplayName("IT06-TC002 [R2] receptionist จองให้ลูกค้า → 201 CONFIRMED / WALK_IN")
    void tc002() throws Exception {
        Res res = book(receptionist(), bookingJson(customer.id(), "THAI", 60, 1, "Room 1", D.atTime(11, 0)));

        assertThat(res.status()).as(res.toString()).isEqualTo(201);
        assertThat(res.str("$.data.status")).isEqualTo("CONFIRMED");
        assertThat(res.str("$.data.bookingChannel")).isEqualTo("WALK_IN");
        assertThat(res.id("$.data.customerId")).isEqualTo(customer.id());
    }

    @Test
    @DisplayName("IT06-TC003 [R1] ไม่ระบุหมอนวดและห้อง → ระบบจัดหมอนวดที่มีทักษะ THAI และห้อง SINGLE")
    void tc003() throws Exception {
        Res res = book(customer.token(), bookingJson(null, "THAI", 60, null, null, D.atTime(11, 0)));

        assertThat(res.status()).as(res.toString()).isEqualTo(201);
        long therapistId = res.id("$.data.therapistId");
        long serviceId = service("THAI").getId();
        assertThat(rows("SELECT COUNT(*) FROM therapist_skills WHERE therapist_id = ? AND service_id = ?",
                therapistId, serviceId)).isEqualTo(1);
        assertThat(res.str("$.data.roomType")).isEqualTo(RoomType.SINGLE.name());
    }

    @Test
    @DisplayName("IT06-TC004 [R3] หมอนวดติดคิว 11:00–12:00 แล้วจอง 11:30 → 409")
    void tc004() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);
        Account other = registerCustomer();

        Res res = book(other.token(), bookingJson(null, "THAI", 60, 1, "Room 2", D.atTime(11, 30)));

        assertThat(res.status()).as(res.toString()).isEqualTo(409);
        assertThat(res.str("$.message")).contains("already booked");
    }

    @Test
    @DisplayName("IT06-TC005 [R1] จองหมอนวดคนเดิมตรงเวลาจบ 12:00 (คนละห้อง) → 201")
    void tc005() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = book(registerCustomer().token(), bookingJson(null, "THAI", 60, 1, "Room 2", D.atTime(12, 0)));

        assertThat(res.status()).as(res.toString()).isEqualTo(201);
    }

    @Test
    @DisplayName("IT06-TC006 [R4] Room 1 ติด 11:00–12:00 แล้วจอง Room 1 เวลา 12:10 → 409 (buffer)")
    void tc006() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = book(registerCustomer().token(), bookingJson(null, "THAI", 60, 2, "Room 1", D.atTime(12, 10)));

        assertThat(res.status()).as(res.toString()).isEqualTo(409);
        assertThat(res.str("$.message")).contains("cleaning buffer");
    }

    @Test
    @DisplayName("IT06-TC007 [R1] Room 1 เวลา 12:15 (พ้น buffer พอดี) → 201")
    void tc007() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = book(registerCustomer().token(), bookingJson(null, "THAI", 60, 2, "Room 1", D.atTime(12, 15)));

        assertThat(res.status()).as(res.toString()).isEqualTo(201);
    }

    @Test
    @DisplayName("IT06-TC008 [R1] ช่วงเวลาที่ถูกยกเลิกแล้วจองได้")
    void tc008() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CANCELLED);

        Res res = book(registerCustomer().token(), bookingJson(null, "THAI", 60, 1, "Room 1", D.atTime(11, 0)));

        assertThat(res.status()).as(res.toString()).isEqualTo(201);
    }

    @Test
    @DisplayName("IT06-TC009 [R3] หมอนวดหยุดวัน D → 409")
    void tc009() throws Exception {
        TherapistSchedule schedule = scheduleRepository
                .findByTherapistIdAndScheduleDate(therapist(1).getId(), D).orElseThrow();
        jdbc.update("DELETE FROM work_shifts WHERE schedule_id = ?", schedule.getId());
        jdbc.update("UPDATE therapist_schedules SET is_day_off = true WHERE id = ?", schedule.getId());

        Res res = book(customer.token(), bookingJson(null, "THAI", 60, 1, "Room 1", D.atTime(11, 0)));

        assertThat(res.status()).as(res.toString()).isEqualTo(409);
        assertThat(res.str("$.message")).contains("is off on this date");
    }

    @Test
    @DisplayName("IT06-TC010 [R5] THAI กับห้อง VIP → 400")
    void tc010() throws Exception {
        Res res = book(customer.token(), bookingJson(null, "THAI", 60, 1, "Room 5", D.atTime(11, 0)));

        assertThat(res.status()).as(res.toString()).isEqualTo(400);
        assertThat(res.str("$.message")).contains("is not suitable");
    }

    @Test
    @DisplayName("IT06-TC011 [R5] durationOption ของบริการอื่น → 400")
    void tc011() throws Exception {
        String body = """
                {"serviceId":%d,"durationOptionId":%d,"therapistId":%d,"roomId":%d,"startDateTime":"%s"}
                """.formatted(service("THAI").getId(), option("AROMA", 90).getId(), therapist(1).getId(),
                room("Room 1").getId(), D.atTime(11, 0));

        Res res = book(customer.token(), body);

        assertThat(res.status()).as(res.toString()).isEqualTo(400);
        assertThat(res.str("$.message")).contains("does not belong");
    }

    @Test
    @DisplayName("IT06-TC012 [R6] ห้อง SINGLE เต็มทั้ง 2 ห้อง และไม่ระบุห้อง → 409")
    void tc012() throws Exception {
        booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);
        booking(customer.id(), 2, "Room 2", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        Res res = book(registerCustomer().token(), bookingJson(null, "THAI", 60, 4, null, D.atTime(11, 0)));

        assertThat(res.status()).as(res.toString()).isEqualTo(409);
        assertThat(res.str("$.message")).contains("No suitable rooms");
    }

    @Test
    @DisplayName("IT06-TC013 [R1] GET /api/bookings/my แสดงรายการที่เพิ่งจอง")
    void tc013() throws Exception {
        Res created = book(customer.token(), bookingJson(null, "THAI", 60, 1, "Room 1", D.atTime(11, 0)));
        String ref = created.str("$.data.bookingReferenceCode");

        Res my = GET("/api/bookings/my", customer.token());

        assertThat(my.status()).isEqualTo(200);
        assertThat(my.list("$.data")).anySatisfy((Map<String, Object> b) -> {
            assertThat(b.get("bookingReferenceCode")).isEqualTo(ref);
            assertThat(b.get("status")).isEqualTo("PENDING");
        });
    }

    @Test
    @DisplayName("IT06-TC014 [R1] ลูกค้าคนอื่นดู booking นี้ → 403")
    void tc014() throws Exception {
        Res created = book(customer.token(), bookingJson(null, "THAI", 60, 1, "Room 1", D.atTime(11, 0)));

        Res res = GET("/api/bookings/" + created.id("$.data.id"), registerCustomer().token());

        assertThat(res.status()).as(res.toString()).isEqualTo(403);
    }

    @Test
    @DisplayName("IT06-TC015 [R1] หมอนวดเจ้าของงานดูได้ หมอนวดคนอื่นได้ 403")
    void tc015() throws Exception {
        Booking b = booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), BookingStatus.CONFIRMED);

        assertThat(GET("/api/bookings/" + b.getId(), therapistToken(1)).status()).isEqualTo(200);
        assertThat(GET("/api/bookings/" + b.getId(), therapistToken(2)).status()).isEqualTo(403);
    }
}
