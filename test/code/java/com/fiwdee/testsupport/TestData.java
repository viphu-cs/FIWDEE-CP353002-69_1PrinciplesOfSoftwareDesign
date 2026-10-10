package com.fiwdee.testsupport;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.BusinessHours;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.Owner;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Receptionist;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.entity.TherapistSkill;
import com.fiwdee.domain.entity.WorkShift;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.DayOfWeek;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.domain.enums.UserRole;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * สร้าง entity สำหรับเทสต์ด้วย no-arg constructor + setter
 * (entity ส่วนใหญ่ไม่มี @Builder.Default จึงไม่ใช้ builder เพื่อให้ list/ค่าเริ่มต้นไม่เป็น null)
 */
public final class TestData {

    /** วันที่ใช้ในเทสต์ Booking: จันทร์ 9 พ.ย. 2026 */
    public static final LocalDate DAY = LocalDate.of(2026, 11, 9);
    /** เวลา "ปัจจุบัน" ที่ตรึงไว้ในเทสต์ที่ขึ้นกับเวลา: จันทร์ 2 พ.ย. 2026 15:00 */
    public static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 2, 15, 0);

    private TestData() {
    }

    public static Customer customer(long id) {
        Customer c = new Customer();
        c.setId(id);
        c.setUsername("customer" + id);
        c.setFullName("ลูกค้า " + id);
        c.setEmail("customer" + id + "@test.com");
        c.setPhoneNumber("08100000" + String.format("%02d", id % 100));
        c.setPasswordHash("hash");
        c.setRole(UserRole.CUSTOMER);
        c.setIsActive(true);
        return c;
    }

    public static Receptionist receptionist(long id) {
        Receptionist r = new Receptionist();
        r.setId(id);
        r.setUsername("reception" + id);
        r.setFullName("พนักงาน " + id);
        r.setRole(UserRole.RECEPTIONIST);
        r.setIsActive(true);
        return r;
    }

    public static Owner owner(long id) {
        Owner o = new Owner();
        o.setId(id);
        o.setUsername("owner" + id);
        o.setFullName("เจ้าของร้าน " + id);
        o.setRole(UserRole.OWNER);
        o.setIsActive(true);
        return o;
    }

    public static Therapist therapist(long id, String name, boolean active) {
        Therapist t = new Therapist();
        t.setId(id);
        t.setUsername("therapist" + id);
        t.setFullName(name);
        t.setNickname(name);
        t.setRole(UserRole.THERAPIST);
        t.setIsActive(active);
        t.setEmploymentStatus(active ? "ACTIVE" : "INACTIVE");
        return t;
    }

    public static Service service(long id, String name, boolean active) {
        Service s = new Service();
        s.setId(id);
        s.setServiceCode("S" + id);
        s.setServiceName(name);
        s.setCategory("MASSAGE");
        s.setRequiredRoomType(RoomType.SINGLE);
        s.setIsActive(active);
        return s;
    }

    public static ServiceDurationOption option(long id, Service s, int minutes, String price, boolean active) {
        ServiceDurationOption o = new ServiceDurationOption();
        o.setId(id);
        o.setService(s);
        o.setDurationMinutes(minutes);
        o.setPrice(new BigDecimal(price));
        o.setIsActive(active);
        return o;
    }

    public static TherapistSkill skill(long id, Therapist t, Service s) {
        TherapistSkill k = new TherapistSkill();
        k.setId(id);
        k.setTherapist(t);
        k.setService(s);
        t.getSkills().add(k);
        return k;
    }

    public static Room room(long id, String number, RoomType type, boolean active) {
        Room r = new Room();
        r.setId(id);
        r.setRoomNumber(number);
        r.setRoomType(type);
        r.setCapacity(1);
        r.setCleaningBufferMinutes(15);
        r.setRoomStatus(RoomStatus.AVAILABLE);
        r.setIsActive(active);
        return r;
    }

    public static TherapistSchedule schedule(Therapist t, LocalDate date, boolean dayOff, LocalTime start, LocalTime end) {
        TherapistSchedule s = new TherapistSchedule();
        s.setTherapist(t);
        s.setScheduleDate(date);
        s.setIsDayOff(dayOff);
        if (start != null) {
            WorkShift w = new WorkShift();
            w.setSchedule(s);
            w.setShiftName("Shift");
            w.setStartTime(start);
            w.setEndTime(end);
            w.setShiftStatus("ACTIVE");
            s.getShifts().add(w);
        }
        return s;
    }

    public static BusinessHours hours(DayOfWeek day, LocalTime open, LocalTime close, boolean closed) {
        BusinessHours h = new BusinessHours();
        h.setDayOfWeek(day);
        h.setOpenTime(open);
        h.setCloseTime(close);
        h.setIsClosed(closed);
        return h;
    }

    public static Booking booking(long id, Customer c, Therapist t, Room r, Service s, ServiceDurationOption o,
                                  LocalDateTime start, int minutes, BookingStatus status) {
        Booking b = Booking.builder()
                .id(id)
                .bookingReferenceCode("BK-TEST-" + id)
                .customer(c)
                .therapist(t)
                .room(r)
                .service(s)
                .durationOption(o)
                .startDateTime(start)
                .endDateTime(start.plusMinutes(minutes))
                .totalPrice(new BigDecimal("600.00"))
                .status(status)
                .bookingChannel("ONLINE")
                .build();
        return b;
    }

    public static Payment payment(long id, Booking b, String net, PaymentStatus status) {
        Payment p = new Payment();
        p.setId(id);
        p.setBooking(b);
        p.setPaymentReferenceCode("PAY-" + id);
        p.setReceiptNumber("REC-" + id);
        p.setGrossAmount(new BigDecimal(net));
        p.setDiscountAmount(BigDecimal.ZERO);
        p.setNetAmount(new BigDecimal(net));
        p.setPaymentMethod(PaymentMethod.CASH);
        p.setPaymentStatus(status);
        p.setPaidAt(NOW.minusDays(1));
        if (b != null) {
            b.setPayment(p);
        }
        return p;
    }
}
