package com.fiwdee.service.impl;

import org.springframework.context.ApplicationEventPublisher;
import org.mockito.MockedStatic;
import com.fiwdee.service.RefundService;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static com.fiwdee.testsupport.TestData.DAY;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.mockingDetails;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.BusinessHours;
import com.fiwdee.domain.entity.Customer;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.entity.Service;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.entity.TherapistSchedule;
import com.fiwdee.domain.entity.TherapistSkill;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.DayOfWeek;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.dto.request.BookingRequestDTO;
import com.fiwdee.mapper.BookingMapper;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.BusinessHoursRepository;
import com.fiwdee.repository.CustomerRepository;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.repository.ServiceDurationOptionRepository;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.repository.TherapistScheduleRepository;
import com.fiwdee.repository.TherapistSkillRepository;
import com.fiwdee.testsupport.TestData;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/**
 * ฐานร่วมของเทสต์ Booking/Availability (UT01–UT05, UT07, UT10, UT11)
 *
 * <p>สร้าง "โลกจำลอง" ในหน่วยความจำ แล้วให้ทุก repository (mock) ตอบจากโลกนี้
 * repository ที่เป็น JPQL ตอบด้วยเงื่อนไขเดียวกับ query จริง (b.start &lt; :end AND b.end &gt; :start)
 * ส่วน default method findConflictingRoomBookingsWithCleaningBuffer เรียกโค้ดจริง (บวก/ลบ buffer 15 นาที)
 *
 * <p>ข้อมูลตั้งต้นตรงกับ "ข้อมูลจำลอง" ใน Excel:
 * S1 active (SINGLE), S2 active, S3 inactive • O11 = S1/60/600 • O12 = S1 inactive • O21 = S2 • O31 = S3
 * T1, T2, T5, T8 active มีทักษะ S1 • T6 ไม่มีทักษะ • T7 inactive • R101, R102 SINGLE • R201 COUPLE • R103 inactive
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
abstract class BookingWorldTestBase {

    static final LocalDateTime START = DAY.atTime(15, 30);

    /**
     * ตรึง LocalDateTime.now() = TestData.NOW (2026-11-02 15:00) ให้คลาสที่เรียก createBooking
     * เพื่อให้เคสยังผ่านหลังทีมแก้ DEF-004 (ตรวจเวลาจองล่วงหน้า 30 นาที – 14 วัน)
     */
    private MockedStatic<LocalDateTime> frozenClock;

    void freezeClock() {
        frozenClock = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS);
        frozenClock.when(LocalDateTime::now).thenReturn(TestData.NOW);
    }

    void releaseClock() {
        if (frozenClock != null) {
            frozenClock.close();
            frozenClock = null;
        }
    }

    @Mock BookingRepository bookingRepository;
    @Mock CustomerRepository customerRepository;
    @Mock ServiceRepository serviceRepository;
    @Mock ServiceDurationOptionRepository durationOptionRepository;
    @Mock RoomRepository roomRepository;
    @Mock TherapistRepository therapistRepository;
    @Mock TherapistSkillRepository therapistSkillRepository;
    @Mock TherapistScheduleRepository therapistScheduleRepository;
    @Mock BusinessHoursRepository businessHoursRepository;
    @Mock BookingMapper bookingMapper;
    /** ยังไม่ถูกใช้ในโค้ดปัจจุบัน • เตรียมไว้ให้ constructor ใหม่หลังแก้ DEF-008 (publish event) และ DEF-007 (คืนเงิน) */
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock RefundService refundService;

    @InjectMocks BookingServiceImpl bookingService;
    @InjectMocks AvailabilityServiceImpl availabilityService;

    final Map<Long, Customer> customers = new HashMap<>();
    final Map<Long, Service> services = new HashMap<>();
    final Map<Long, ServiceDurationOption> options = new HashMap<>();
    final Map<Long, Therapist> therapists = new HashMap<>();
    final List<TherapistSkill> skills = new ArrayList<>();
    final Map<String, TherapistSchedule> schedules = new HashMap<>();
    final List<Room> rooms = new ArrayList<>();
    final Map<DayOfWeek, BusinessHours> hours = new EnumMap<>(DayOfWeek.class);
    final List<Booking> bookings = new ArrayList<>();
    private long nextId = 9000;

    Customer c1, c2;
    Service s1, s2, s3;
    ServiceDurationOption o11, o12, o21, o31;
    Therapist t1, t2, t5, t6, t7, t8;
    Room r101, r102, r103, r201;

    @BeforeEach
    void setUpWorld() {
        c1 = put(TestData.customer(1));
        c2 = put(TestData.customer(2));

        s1 = putService(TestData.service(1, "นวดไทยราชสำนัก", true));
        s2 = putService(TestData.service(2, "นวดเท้า", true));
        s3 = putService(TestData.service(3, "นวดอโรมา", false));
        o11 = putOption(TestData.option(11, s1, 60, "600.00", true));
        o12 = putOption(TestData.option(12, s1, 120, "1100.00", false));
        o21 = putOption(TestData.option(21, s2, 60, "500.00", true));
        o31 = putOption(TestData.option(31, s3, 60, "800.00", true));

        t1 = putTherapist(TestData.therapist(1, "สมศรี", true), s1);
        t2 = putTherapist(TestData.therapist(2, "แก้ว", true), s1);
        t5 = putTherapist(TestData.therapist(5, "มะลิ", true), s1);
        t6 = putTherapist(TestData.therapist(6, "บัว", true));
        t7 = putTherapist(TestData.therapist(7, "แพรว", false), s1);
        t8 = putTherapist(TestData.therapist(8, "กานต์", true), s1);

        r101 = putRoom(TestData.room(101, "R101", RoomType.SINGLE, true));
        r102 = putRoom(TestData.room(102, "R102", RoomType.SINGLE, true));
        r201 = putRoom(TestData.room(201, "R201", RoomType.COUPLE, true));
        r103 = putRoom(TestData.room(103, "R103", RoomType.SINGLE, false));

        for (DayOfWeek d : DayOfWeek.values()) {
            hours.put(d, TestData.hours(d, LocalTime.of(10, 0), LocalTime.of(22, 0), false));
        }
        wire();
    }

    // ---------------------------------------------------------------- world helpers
    Customer put(Customer c) {
        customers.put(c.getId(), c);
        return c;
    }

    Service putService(Service s) {
        services.put(s.getId(), s);
        return s;
    }

    ServiceDurationOption putOption(ServiceDurationOption o) {
        options.put(o.getId(), o);
        return o;
    }

    Therapist putTherapist(Therapist t, Service... skilledIn) {
        therapists.put(t.getId(), t);
        for (Service s : skilledIn) {
            skills.add(TestData.skill(nextId++, t, s));
        }
        return t;
    }

    Room putRoom(Room r) {
        rooms.add(r);
        return r;
    }

    /** ให้มีเฉพาะหมอนวดที่ระบุเท่านั้นที่มีทักษะ s */
    void onlyQualified(Service s, Long... therapistIds) {
        List<Long> keep = List.of(therapistIds);
        skills.removeIf(k -> k.getService() == s && !keep.contains(k.getTherapist().getId()));
    }

    void dayOff(Therapist t, LocalDate date) {
        schedules.put(t.getId() + "@" + date, TestData.schedule(t, date, true, null, null));
    }

    void shift(Therapist t, LocalDate date, LocalTime start, LocalTime end) {
        schedules.put(t.getId() + "@" + date, TestData.schedule(t, date, false, start, end));
    }

    Booking existing(long id, Therapist t, Room r, LocalDateTime start, int minutes, BookingStatus status) {
        Booking b = TestData.booking(id, c2, t, r, s1, o11, start, minutes, status);
        bookings.add(b);
        return b;
    }

    BookingRequestDTO request(Long customerId, Long serviceId, Long optionId, Long therapistId, Long roomId,
                              LocalDateTime start) {
        return BookingRequestDTO.builder()
                .customerId(customerId)
                .serviceId(serviceId)
                .durationOptionId(optionId)
                .therapistId(therapistId)
                .roomId(roomId)
                .startDateTime(start)
                .specialNotes("ปวดสะบักซ้าย")
                .build();
    }

    /** Booking ตัวล่าสุดที่ถูกส่งเข้า bookingRepository.save */
    Booking savedBooking() {
        return mockingDetails(bookingRepository).getInvocations().stream()
                .filter(i -> i.getMethod().getName().equals("save"))
                .map(i -> i.getArguments()[0])
                .filter(Booking.class::isInstance)
                .map(Booking.class::cast)
                .reduce((a, b) -> b)
                .orElseThrow(() -> new AssertionError("คาดว่า bookingRepository.save ถูกเรียก แต่ไม่ถูกเรียก"));
    }

    void assertNotSaved() {
        assertThat(mockingDetails(bookingRepository).getInvocations().stream()
                .filter(i -> i.getMethod().getName().equals("save")))
                .as("bookingRepository.save ต้องไม่ถูกเรียก")
                .isEmpty();
    }

    // ---------------------------------------------------------------- repository wiring
    private boolean overlaps(Booking b, LocalDateTime start, LocalDateTime end) {
        return b.getStartDateTime().isBefore(end) && b.getEndDateTime().isAfter(start);
    }

    private Optional<Booking> bookingById(Object id) {
        return bookings.stream().filter(b -> Objects.equals(b.getId(), id)).findFirst();
    }

    private void wire() {
        when(customerRepository.findById(any())).thenAnswer(i -> Optional.ofNullable(customers.get((Long) i.getArgument(0))));
        when(serviceRepository.findById(any())).thenAnswer(i -> Optional.ofNullable(services.get((Long) i.getArgument(0))));
        when(durationOptionRepository.findById(any())).thenAnswer(i -> Optional.ofNullable(options.get((Long) i.getArgument(0))));
        when(durationOptionRepository.findByServiceIdAndIsActiveTrue(any())).thenAnswer(i -> options.values().stream()
                .filter(o -> o.getService().getId().equals(i.getArgument(0)) && Boolean.TRUE.equals(o.getIsActive()))
                .sorted((a, b) -> Long.compare(a.getId(), b.getId()))
                .toList());
        when(therapistRepository.findById(any())).thenAnswer(i -> Optional.ofNullable(therapists.get((Long) i.getArgument(0))));
        when(therapistSkillRepository.findByTherapistId(any())).thenAnswer(i -> skills.stream()
                .filter(k -> k.getTherapist().getId().equals(i.getArgument(0))).toList());
        when(therapistSkillRepository.findByServiceId(any())).thenAnswer(i -> skills.stream()
                .filter(k -> k.getService().getId().equals(i.getArgument(0)))
                .sorted((a, b) -> Long.compare(a.getTherapist().getId(), b.getTherapist().getId()))
                .toList());
        when(therapistScheduleRepository.findByTherapistIdAndScheduleDate(any(), any())).thenAnswer(i ->
                Optional.ofNullable(schedules.get(i.getArgument(0) + "@" + i.getArgument(1))));
        when(roomRepository.findById(any())).thenAnswer(i -> rooms.stream()
                .filter(r -> r.getId().equals(i.getArgument(0))).findFirst());
        when(roomRepository.findByIsActiveTrue()).thenAnswer(i -> rooms.stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsActive())).toList());
        when(businessHoursRepository.findByDayOfWeek(any())).thenAnswer(i -> Optional.ofNullable(hours.get((DayOfWeek) i.getArgument(0))));

        when(bookingRepository.findDetailedById(any())).thenAnswer(i -> bookingById(i.getArgument(0)));
        when(bookingRepository.findById(any())).thenAnswer(i -> bookingById(i.getArgument(0)));
        when(bookingRepository.findConflictingRoomBookingsWithCleaningBuffer(any(), any(), any(), anyInt(), any()))
                .thenCallRealMethod();
        when(bookingRepository.findConflictingRoomBookings(any(), any(), any(), any())).thenAnswer(i -> {
            Long roomId = i.getArgument(0);
            Collection<?> excluded = i.getArgument(3);
            return bookings.stream()
                    .filter(b -> b.getRoom() != null && b.getRoom().getId().equals(roomId))
                    .filter(b -> !excluded.contains(b.getStatus()))
                    .filter(b -> overlaps(b, i.getArgument(1), i.getArgument(2)))
                    .toList();
        });
        when(bookingRepository.findConflictingTherapistBookings(any(), any(), any(), any())).thenAnswer(i -> {
            Long therapistId = i.getArgument(0);
            Collection<?> excluded = i.getArgument(3);
            return bookings.stream()
                    .filter(b -> b.getTherapist() != null && b.getTherapist().getId().equals(therapistId))
                    .filter(b -> !excluded.contains(b.getStatus()))
                    .filter(b -> overlaps(b, i.getArgument(1), i.getArgument(2)))
                    .toList();
        });
        when(bookingRepository.save(any())).thenAnswer(i -> {
            Booking b = i.getArgument(0);
            if (b.getId() == null) {
                b.setId(nextId++);
            }
            return b;
        });
    }
}
