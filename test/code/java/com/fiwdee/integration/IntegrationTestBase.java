package com.fiwdee.integration;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.entity.WorkShift;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentMethod;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.pattern.observer.QueueListener;
import com.fiwdee.pattern.strategy.CashPaymentStrategy;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.CustomerRepository;
import com.fiwdee.repository.PaymentRepository;
import com.fiwdee.repository.QueueItemRepository;
import com.fiwdee.repository.ReviewRepository;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.repository.ServiceDurationOptionRepository;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.repository.TherapistScheduleRepository;
import com.fiwdee.repository.UserRepository;
import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.jayway.jsonpath.PathNotFoundException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/**
 * ฐานร่วมของ Integration Test ทุกคลาส (IT01–IT12)
 *
 * <ul>
 *   <li>โหลด Spring context ทั้งแอปพร้อม Security จริง และยิง HTTP ผ่าน MockMvc</li>
 *   <li>ใช้ PostgreSQL จริง (profile {@code it}) ข้อมูลตั้งต้นมาจาก ItBaselineSeeder</li>
 *   <li>ทุกคลาสใช้ annotation ชุดเดียวกัน → Spring สร้าง context ครั้งเดียวแล้วใช้ร่วมกัน</li>
 *   <li>ไม่ใช้ @Transactional เพื่อให้แต่ละ request commit จริงเหมือนตอนใช้งาน
 *       แล้วล้างข้อมูลด้วย SQL ก่อนและหลังทุกเคส</li>
 * </ul>
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("it")
@Tag("integration")
public abstract class IntegrationTestBase {

    protected static final String STAFF_PASSWORD = "pass123";
    protected static final String CUSTOMER_PASSWORD = "password123";
    protected static final List<BookingStatus> EXCLUDED = List.of(BookingStatus.CANCELLED, BookingStatus.NO_SHOW);

    /** วันที่ใช้จองผ่าน API: อีก 7 วัน (อยู่ในช่วงจองล่วงหน้าที่ระบบควรรับ) */
    protected final LocalDate D = LocalDate.now().plusDays(7);

    @Autowired protected MockMvc mvc;
    @Autowired protected JdbcTemplate jdbc;
    @Autowired protected BookingRepository bookingRepository;
    @Autowired protected CustomerRepository customerRepository;
    @Autowired protected PaymentRepository paymentRepository;
    @Autowired protected QueueItemRepository queueItemRepository;
    @Autowired protected ReviewRepository reviewRepository;
    @Autowired protected RoomRepository roomRepository;
    @Autowired protected ServiceRepository serviceRepository;
    @Autowired protected ServiceDurationOptionRepository durationOptionRepository;
    @Autowired protected TherapistRepository therapistRepository;
    @Autowired protected TherapistScheduleRepository scheduleRepository;
    @Autowired protected UserRepository userRepository;

    /** Spy: ยังทำงานจริงทุกอย่าง แต่ตรวจได้ว่าถูกเรียกด้วย event อะไร (IT10) */
    @MockitoSpyBean protected QueueListener queueListener;

    /** Spy ที่ใช้เป็น Stub เฉพาะเคสจำลองการชำระล้มเหลว (IT09) – เคสอื่นทำงานจริง และ reset อัตโนมัติหลังทุกเคส */
    @MockitoSpyBean protected CashPaymentStrategy cashPaymentStrategy;

    /** token ของพนักงาน (ข้อมูล seed ไม่ถูกลบ จึง cache ข้าม test ได้) */
    private static final Map<String, String> STAFF_TOKENS = new ConcurrentHashMap<>();

    // =========================================================== lifecycle

    @BeforeEach
    void prepareBaseline() {
        cleanDatabase();
        ensureDayShifts(D);
    }

    @AfterEach
    void cleanUp() {
        cleanDatabase();
    }

    /** คืนฐานข้อมูลให้เหลือเฉพาะข้อมูลจาก ItBaselineSeeder */
    protected void cleanDatabase() {
        jdbc.execute("TRUNCATE TABLE reviews, refunds, payments, queue_items, bookings RESTART IDENTITY CASCADE");
        jdbc.update("DELETE FROM work_shifts WHERE schedule_id IN "
                + "(SELECT id FROM therapist_schedules WHERE schedule_date <> DATE '2099-01-01')");
        jdbc.update("DELETE FROM therapist_schedules WHERE schedule_date <> DATE '2099-01-01'");
        jdbc.update("DELETE FROM therapist_skills WHERE therapist_id IN (SELECT id FROM users WHERE username LIKE 'it.%')");
        jdbc.update("DELETE FROM therapist_skills WHERE service_id IN (SELECT id FROM services WHERE service_code LIKE 'IT-%')");
        jdbc.update("DELETE FROM therapists WHERE id IN (SELECT id FROM users WHERE username LIKE 'it.%')");
        jdbc.update("DELETE FROM customers WHERE id IN (SELECT id FROM users WHERE username LIKE 'it.%')");
        jdbc.update("DELETE FROM users WHERE username LIKE 'it.%'");
        jdbc.update("DELETE FROM service_duration_options WHERE service_id IN (SELECT id FROM services WHERE service_code LIKE 'IT-%')");
        jdbc.update("DELETE FROM services WHERE service_code LIKE 'IT-%'");
        jdbc.update("DELETE FROM rooms WHERE room_number LIKE 'IT-%'");
        jdbc.update("UPDATE rooms SET room_status = 'AVAILABLE', is_active = true");
        jdbc.update("UPDATE services SET is_active = true");
        jdbc.update("UPDATE service_duration_options SET is_active = true");
        jdbc.update("UPDATE users SET is_active = true");
        jdbc.update("UPDATE therapists SET average_rating = 0");
        jdbc.update("UPDATE business_hours SET is_closed = false, open_time = TIME '10:00', close_time = TIME '22:00'");
    }

    /** ให้หมอนวดทุกคนมีกะ 10:00–22:00 (เต็มเวลาทำการ) ในวันที่กำหนด (ผลจึงไม่เปลี่ยนแม้ทีมแก้ DEF-005 ให้ตรวจกะ) */
    protected void ensureDayShifts(LocalDate date) {
        for (Therapist t : therapistRepository.findAll()) {
            if (scheduleRepository.findByTherapistIdAndScheduleDate(t.getId(), date).isPresent()) {
                continue;
            }
            TherapistSchedule s = new TherapistSchedule();
            s.setTherapist(t);
            s.setScheduleDate(date);
            s.setIsDayOff(false);
            WorkShift w = new WorkShift();
            w.setSchedule(s);
            w.setShiftName("IT Shift");
            w.setStartTime(LocalTime.of(10, 0));
            w.setEndTime(LocalTime.of(22, 0));
            w.setShiftStatus("ACTIVE");
            s.getShifts().add(w);
            scheduleRepository.save(s);
        }
    }

    // =========================================================== seed lookups

    protected Therapist therapist(int n) {
        return (Therapist) userRepository.findByUsername("therapist" + n).orElseThrow();
    }

    protected Room room(String number) {
        return roomRepository.findByRoomNumberIgnoreCase(number).orElseThrow();
    }

    protected Service service(String code) {
        return serviceRepository.findByServiceCodeIgnoreCase(code).orElseThrow();
    }

    protected ServiceDurationOption option(String serviceCode, int minutes) {
        Long serviceId = service(serviceCode).getId();
        return durationOptionRepository.findByServiceIdAndIsActiveTrue(serviceId).stream()
                .filter(o -> o.getDurationMinutes() == minutes)
                .findFirst()
                .orElseThrow();
    }

    /**
     * เคสที่ต้องใช้ "วันนี้" (check-in, call-next) จะข้ามตัวเองช่วง 23:50–00:00
     * เพราะโค้ดเรียก LocalDateTime.now() ตรง ๆ ถ้าข้ามเที่ยงคืนระหว่างเทสต์ ผลจะผิดโดยไม่เกี่ยวกับบั๊ก
     */
    protected static void assumeNotNearMidnight() {
        org.junit.jupiter.api.Assumptions.assumeTrue(LocalTime.now().isBefore(LocalTime.of(23, 50)),
                "ข้ามเคสนี้ช่วงใกล้เที่ยงคืน (ขึ้นกับวันที่ปัจจุบัน)");
    }

    /** เวลาเริ่มของ booking "วันนี้" ที่ check-in ได้ทันที (อีก 5 นาที หรือ ตอนนี้ ถ้าข้ามเที่ยงคืน) */
    protected LocalDateTime soon() {
        LocalDateTime now = LocalDateTime.now().truncatedTo(ChronoUnit.MINUTES);
        LocalDateTime candidate = now.plusMinutes(5);
        return candidate.toLocalDate().equals(now.toLocalDate()) ? candidate : now;
    }

    // =========================================================== fixtures (เขียนลงฐานข้อมูลตรง)

    /** สร้าง booking ด้วย repository ตรง ใช้เมื่อ API ไม่ควรรับข้อมูลแบบนั้น (เช่น นัดในอีก 5 นาที หรือสถานะเริ่มต้นอื่น) */
    protected Booking booking(Long customerId, Integer therapistNo, String roomNumber, String serviceCode, int minutes,
                              LocalDateTime start, BookingStatus status) {
        Customer customer = customerRepository.findById(customerId).orElseThrow();
        ServiceDurationOption opt = option(serviceCode, minutes);
        Booking b = Booking.builder()
                .bookingReferenceCode("IT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .customer(customer)
                .therapist(therapistNo == null ? null : therapist(therapistNo))
                .room(room(roomNumber))
                .service(service(serviceCode))
                .durationOption(opt)
                .startDateTime(start)
                .endDateTime(start.plusMinutes(minutes))
                .totalPrice(opt.getPrice())
                .status(status)
                .bookingChannel("WALK_IN")
                .build();
        return bookingRepository.save(b);
    }

    protected Payment payment(Booking booking, String net, PaymentStatus status, LocalDateTime paidAt) {
        String ref = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return paymentRepository.save(Payment.builder()
                .booking(booking)
                .paymentReferenceCode("PAY-IT-" + ref)
                .receiptNumber("REC-IT-" + ref)
                .grossAmount(new BigDecimal(net))
                .discountAmount(BigDecimal.ZERO)
                .netAmount(new BigDecimal(net))
                .paymentMethod(PaymentMethod.CASH)
                .paymentStatus(status)
                .paidAt(paidAt)
                .build());
    }

    // =========================================================== accounts

    /** ลูกค้าที่สมัครผ่าน API จริง */
    protected record Account(Long id, String token, String email, String fullName, String phone) {
    }

    protected Account registerCustomer() throws Exception {
        return registerCustomer("Customer " + UUID.randomUUID().toString().substring(0, 6));
    }

    protected Account registerCustomer(String fullName) throws Exception {
        String email = "it." + UUID.randomUUID().toString().substring(0, 8) + "@test.com";
        String phone = "09" + String.format("%08d", ThreadLocalRandom.current().nextInt(100_000_000));
        Res res = POST("/api/auth/register", null, """
                {"fullName":"%s","email":"%s","phoneNumber":"%s","password":"%s"}
                """.formatted(fullName, email, phone, CUSTOMER_PASSWORD));
        if (res.status() != 201) {
            throw new IllegalStateException("register failed: " + res.status() + " " + res.body());
        }
        return new Account(res.id("$.data.userId"), res.str("$.data.token"), email, fullName, phone);
    }

    protected String login(String identifier, String password) throws Exception {
        Res res = POST("/api/auth/login", null, """
                {"identifier":"%s","password":"%s"}
                """.formatted(identifier, password));
        if (res.status() != 200) {
            throw new IllegalStateException("login failed for " + identifier + ": " + res.status() + " " + res.body());
        }
        return res.str("$.data.token");
    }

    protected String staffToken(String username) throws Exception {
        String cached = STAFF_TOKENS.get(username);
        if (cached != null) {
            return cached;
        }
        String token = login(username, STAFF_PASSWORD);
        STAFF_TOKENS.put(username, token);
        return token;
    }

    protected String owner() throws Exception {
        return staffToken("owner");
    }

    protected String receptionist() throws Exception {
        return staffToken("receptionist");
    }

    protected String therapistToken(int n) throws Exception {
        return staffToken("therapist" + n);
    }

    // =========================================================== HTTP helpers

    /** ผลของ 1 request: status + body ที่อ่านเป็น UTF-8 (ข้อความภาษาไทยไม่เพี้ยน) */
    protected record Res(int status, String body, DocumentContext json) {

        public Object read(String path) {
            return json.read(path);
        }

        public String str(String path) {
            Object v = json.read(path);
            return v == null ? null : v.toString();
        }

        public long id(String path) {
            return ((Number) json.read(path)).longValue();
        }

        public BigDecimal dec(String path) {
            return new BigDecimal(json.read(path).toString());
        }

        @SuppressWarnings("unchecked")
        public List<Map<String, Object>> list(String path) {
            return (List<Map<String, Object>>) json.read(path);
        }

        public boolean has(String path) {
            try {
                return json != null && json.read(path) != null;
            } catch (PathNotFoundException e) {
                return false;
            }
        }

        @Override
        public String toString() {
            return status + " " + body;
        }
    }

    protected Res call(MockHttpServletRequestBuilder req, String token, String body) throws Exception {
        if (token != null) {
            req.header("Authorization", "Bearer " + token);
        }
        if (body != null) {
            req.contentType(MediaType.APPLICATION_JSON).characterEncoding(StandardCharsets.UTF_8).content(body);
        }
        MvcResult r = mvc.perform(req).andReturn();
        String s = r.getResponse().getContentAsString(StandardCharsets.UTF_8);
        DocumentContext json = null;
        if (s != null && !s.isBlank() && (s.startsWith("{") || s.startsWith("["))) {
            json = JsonPath.parse(s);
        }
        return new Res(r.getResponse().getStatus(), s, json);
    }

    protected Res GET(String url, String token) throws Exception {
        return call(get(url), token, null);
    }

    protected Res POST(String url, String token, String body) throws Exception {
        return call(post(url), token, body);
    }

    protected Res PUT(String url, String token, String body) throws Exception {
        return call(put(url), token, body);
    }

    protected Res PATCH(String url, String token, String body) throws Exception {
        return call(patch(url), token, body);
    }

    protected Res DELETE(String url, String token) throws Exception {
        return call(delete(url), token, null);
    }

    // =========================================================== request bodies

    /** body ของ POST /api/bookings (ค่า null จะไม่ถูกส่ง) */
    protected String bookingJson(Long customerId, String serviceCode, int minutes, Integer therapistNo, String roomNumber,
                                 LocalDateTime start) {
        List<String> f = new ArrayList<>();
        if (customerId != null) {
            f.add("\"customerId\":" + customerId);
        }
        f.add("\"serviceId\":" + service(serviceCode).getId());
        f.add("\"durationOptionId\":" + option(serviceCode, minutes).getId());
        if (therapistNo != null) {
            f.add("\"therapistId\":" + therapist(therapistNo).getId());
        }
        if (roomNumber != null) {
            f.add("\"roomId\":" + room(roomNumber).getId());
        }
        f.add("\"startDateTime\":\"" + start + "\"");
        return "{" + String.join(",", f) + "}";
    }

    protected String availabilityUrl(LocalDate date, String serviceCode, int minutes) {
        return "/api/bookings/availability?date=" + date + "&serviceId=" + service(serviceCode).getId()
                + "&durationMinutes=" + minutes;
    }

    /** หา slot ตามเวลา เช่น "11:00" จากผลของ availability */
    protected Map<String, Object> slot(Res availability, String time) {
        return availability.list("$.data.availableSlots").stream()
                .filter(s -> time.equals(s.get("time")))
                .findFirst()
                .orElseThrow(() -> new AssertionError("ไม่มีรอบ " + time + " ใน " + availability.body()));
    }

    @SuppressWarnings("unchecked")
    protected static int count(Map<String, Object> slot, String key) {
        return ((List<Object>) slot.get(key)).size();
    }

    // =========================================================== DB reads (SQL ตรง เพื่อยืนยันสิ่งที่ถูกบันทึกจริง)

    protected String bookingStatus(long bookingId) {
        return jdbc.queryForObject("SELECT status FROM bookings WHERE id = ?", String.class, bookingId);
    }

    protected String roomStatus(String roomNumber) {
        return jdbc.queryForObject("SELECT room_status FROM rooms WHERE room_number = ?", String.class, roomNumber);
    }

    protected int rows(String sql, Object... args) {
        Integer n = jdbc.queryForObject(sql, Integer.class, args);
        return n == null ? 0 : n;
    }
}
