package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.entity.Review;
import com.fiwdee.domain.entity.User;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.PaymentStatus;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.domain.enums.UserRole;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

/** IT02 – Repository / JPA mapping บน PostgreSQL จริง (Weak Robust EC) */
@DisplayName("IT02 JPA mapping & queries on PostgreSQL – EC")
class IT02_JpaMappingTest extends IntegrationTestBase {

    private Account somchai;
    private Booking b1;   // D 10:00 CONFIRMED
    private Booking b2;   // D 13:00 CANCELLED
    private Booking b3;   // D+1 10:00 PENDING

    @BeforeEach
    void data() throws Exception {
        somchai = registerCustomer("Somchai ITSEARCH");
        Account other = registerCustomer("Other Person");
        b1 = booking(somchai.id(), 1, "Room 1", "THAI", 60, D.atTime(10, 0), BookingStatus.CONFIRMED);
        b2 = booking(other.id(), 2, "Room 2", "THAI", 60, D.atTime(13, 0), BookingStatus.CANCELLED);
        b3 = booking(other.id(), 1, "Room 1", "THAI", 60, D.plusDays(1).atTime(10, 0), BookingStatus.PENDING);
    }

    /**
     * เรียก query แบบเดียวกับ BookingServiceImpl.getAdminBookings เวอร์ชันปัจจุบัน
     * (ทีมเปลี่ยน contract: ไม่รับวันที่ null แต่ใช้ช่วง 1970–2099 แทน และไม่กรองชื่อเมื่อ search = "")
     */
    private Page<Booking> admin(LocalDate date, BookingStatus status, String search, int size) {
        LocalDateTime from = date == null ? LocalDateTime.of(1970, 1, 1, 0, 0) : date.atStartOfDay();
        LocalDateTime to = date == null ? LocalDateTime.of(2099, 12, 31, 23, 59, 59) : date.atTime(LocalTime.MAX);
        String safeSearch = search == null || search.isBlank() ? "" : search.trim();
        return bookingRepository.findAdminBookings(from, to, status, safeSearch,
                PageRequest.of(0, size, Sort.by(Sort.Direction.DESC, "startDateTime")));
    }

    @Test
    @DisplayName("IT02-TC001 (V1) findDetailedById ใช้ความสัมพันธ์นอก transaction ได้")
    void tc001() {
        Booking b = bookingRepository.findDetailedById(b1.getId()).orElseThrow();
        // ไม่มี transaction เปิดอยู่ในเทสต์ ถ้า EntityGraph ไม่ครบจะเกิด LazyInitializationException ตรงนี้
        assertThat(b.getCustomer().getFullName()).isEqualTo("Somchai ITSEARCH");
        assertThat(b.getTherapist().getUsername()).isEqualTo("therapist1");
        assertThat(b.getRoom().getRoomNumber()).isEqualTo("Room 1");
        assertThat(b.getService().getServiceCode()).isEqualTo("THAI");
        assertThat(b.getDurationOption().getDurationMinutes()).isEqualTo(60);
    }

    @Test
    @DisplayName("IT02-TC002 (V2) findAdminBookings ไม่กรองอะไรเลย → ทำงานบน PostgreSQL และเรียงใหม่ไปเก่า")
    void tc002() {
        Page<Booking> page = admin(null, null, null, 10);
        assertThat(page.getContent()).extracting(Booking::getId).containsExactly(b3.getId(), b2.getId(), b1.getId());
    }

    @Test
    @DisplayName("IT02-TC003 (V3) ค้นหาชื่อลูกค้าแบบไม่สนตัวพิมพ์")
    void tc003() {
        assertThat(admin(null, null, "itsearch", 10).getContent()).extracting(Booking::getId).containsExactly(b1.getId());
    }

    @Test
    @DisplayName("IT02-TC004 (V4) กรอง status = CANCELLED")
    void tc004() {
        assertThat(admin(null, BookingStatus.CANCELLED, null, 10).getContent()).extracting(Booking::getId)
                .containsExactly(b2.getId());
    }

    @Test
    @DisplayName("IT02-TC005 (V4) กรองวันที่ D")
    void tc005() {
        assertThat(admin(D, null, null, 10).getContent()).extracting(Booking::getId)
                .containsExactlyInAnyOrder(b1.getId(), b2.getId());
    }

    @Test
    @DisplayName("IT02-TC006 (V4) แบ่งหน้า size 2")
    void tc006() {
        Page<Booking> page = admin(null, null, null, 2);
        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getTotalElements()).isEqualTo(3);
        assertThat(page.getTotalPages()).isEqualTo(2);
    }

    @Test
    @DisplayName("IT02-TC007 (V5) findCompletedPaymentsBetween นับเฉพาะ COMPLETED และ REFUNDED")
    void tc007() {
        LocalDateTime at = D.atTime(15, 0);
        Payment completed = payment(b1, "500.00", PaymentStatus.COMPLETED, at);
        Payment refunded = payment(b2, "500.00", PaymentStatus.REFUNDED, at);
        payment(b3, "500.00", PaymentStatus.PENDING, at);
        Booking b4 = booking(somchai.id(), 4, "Room 2", "THAI", 60, D.atTime(16, 0), BookingStatus.CONFIRMED);
        payment(b4, "500.00", PaymentStatus.FAILED, at);

        List<Payment> found = paymentRepository.findCompletedPaymentsBetween(D.atStartOfDay(), D.atTime(LocalTime.MAX));

        assertThat(found).extracting(Payment::getId).containsExactlyInAnyOrder(completed.getId(), refunded.getId());
    }

    @Test
    @DisplayName("IT02-TC008 (V5) ขอบช่วงเวลารวมทั้งสองด้าน")
    void tc008() {
        LocalDateTime from = D.atTime(9, 0);
        LocalDateTime to = D.atTime(18, 0);
        Payment atStart = payment(b1, "100.00", PaymentStatus.COMPLETED, from);
        Payment atEnd = payment(b2, "100.00", PaymentStatus.COMPLETED, to);
        payment(b3, "100.00", PaymentStatus.COMPLETED, from.minusSeconds(1));
        Booking b4 = booking(somchai.id(), 4, "Room 2", "THAI", 60, D.atTime(16, 0), BookingStatus.CONFIRMED);
        payment(b4, "100.00", PaymentStatus.COMPLETED, to.plusSeconds(1));

        assertThat(paymentRepository.findCompletedPaymentsBetween(from, to)).extracting(Payment::getId)
                .containsExactlyInAnyOrder(atStart.getId(), atEnd.getId());
    }

    @Test
    @DisplayName("IT02-TC009 (V2) findUsersPage(null, null) ทำงานบน PostgreSQL")
    void tc009() {
        Page<User> page = userRepository.findUsersPage(null, null, PageRequest.of(0, 50));
        assertThat(page.getTotalElements()).isGreaterThanOrEqualTo(8);
    }

    @Test
    @DisplayName("IT02-TC010 (V3) findUsersPage(THERAPIST, \"five\")")
    void tc010() {
        Page<User> page = userRepository.findUsersPage(UserRole.THERAPIST, "five", PageRequest.of(0, 10));
        assertThat(page.getContent()).extracting(User::getUsername).containsExactly("therapist5");
    }

    @Test
    @DisplayName("IT02-TC011 (I1) payment ใบที่ 2 ของ booking เดียวกัน → DataIntegrityViolationException")
    void tc011() {
        payment(b1, "500.00", PaymentStatus.COMPLETED, LocalDateTime.now());
        assertThrows(DataIntegrityViolationException.class,
                () -> payment(b1, "500.00", PaymentStatus.COMPLETED, LocalDateTime.now()));
    }

    @Test
    @DisplayName("IT02-TC012 (I2) review ใบที่ 2 ของ booking เดียวกัน → DataIntegrityViolationException")
    void tc012() {
        reviewRepository.save(review(b1));
        assertThrows(DataIntegrityViolationException.class, () -> reviewRepository.save(review(b1)));
    }

    @Test
    @DisplayName("IT02-TC013 (I3) เลขคิวซ้ำในวันเดียวกัน → DataIntegrityViolationException")
    void tc013() {
        LocalDate today = LocalDate.now();
        queueItemRepository.save(queue(b1, "Q001", today));
        assertThrows(DataIntegrityViolationException.class, () -> queueItemRepository.save(queue(b3, "Q001", today)));
    }

    @Test
    @DisplayName("IT02-TC014 (V6) enum BookingStatus ถูกเก็บเป็นข้อความ")
    void tc014() {
        assertThat(bookingStatus(b1.getId())).isEqualTo("CONFIRMED");
    }

    private static Review review(Booking b) {
        Review r = new Review();
        r.setBooking(b);
        r.setOverallRating(5);
        r.setTherapistRating(5);
        r.setCleanlinessRating(5);
        return r;
    }

    private static QueueItem queue(Booking b, String number, LocalDate date) {
        return QueueItem.builder()
                .booking(b)
                .queueNumber(number)
                .queueDate(date)
                .checkInTime(LocalDateTime.now())
                .queueStatus(QueueStatus.WAITING)
                .priorityLevel(0)
                .build();
    }
}
