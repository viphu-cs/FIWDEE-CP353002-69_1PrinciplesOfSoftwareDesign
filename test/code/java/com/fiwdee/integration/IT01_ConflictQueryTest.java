package com.fiwdee.integration;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.enums.BookingStatus;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/**
 * IT01 – BookingRepository: query หาการจองที่ชนกัน รันบน PostgreSQL จริง (BVA)
 * booking เดิม: therapist1 / Room 1 วัน D 11:00–12:00
 */
@DisplayName("IT01 Conflict queries on PostgreSQL – BVA")
class IT01_ConflictQueryTest extends IntegrationTestBase {

    @ParameterizedTest(name = "{0} {1} {2}–{3} existing={4} → {5}")
    @CsvSource({
        "IT01-TC001, THERAPIST, 09:59, 10:59, CONFIRMED, 0",
        "IT01-TC002, THERAPIST, 10:00, 11:00, CONFIRMED, 0",
        "IT01-TC003, THERAPIST, 10:01, 11:01, CONFIRMED, 1",
        "IT01-TC004, THERAPIST, 11:59, 12:59, CONFIRMED, 1",
        "IT01-TC005, THERAPIST, 12:00, 13:00, CONFIRMED, 0",
        "IT01-TC006, THERAPIST, 12:01, 13:01, CONFIRMED, 0",
        "IT01-TC007, THERAPIST, 11:00, 12:00, CONFIRMED, 1",
        "IT01-TC008, THERAPIST, 10:00, 13:00, CONFIRMED, 1",
        "IT01-TC009, ROOM,      12:14, 13:14, CONFIRMED, 1",
        "IT01-TC010, ROOM,      12:15, 13:15, CONFIRMED, 0",
        "IT01-TC011, ROOM,      12:16, 13:16, CONFIRMED, 0",
        "IT01-TC012, ROOM,      09:44, 10:44, CONFIRMED, 0",
        "IT01-TC013, ROOM,      09:45, 10:45, CONFIRMED, 0",
        "IT01-TC014, ROOM,      09:46, 10:46, CONFIRMED, 1",
        "IT01-TC015, THERAPIST, 11:00, 12:00, CANCELLED, 0",
        "IT01-TC016, THERAPIST, 11:00, 12:00, NO_SHOW,   0",
        "IT01-TC017, THERAPIST, 11:00, 12:00, PENDING,   1",
        "IT01-TC018, OTHER_THERAPIST, 11:00, 12:00, CONFIRMED, 0"
    })
    void conflict(String tc, String query, LocalTime from, LocalTime to, BookingStatus existingStatus, int expected)
            throws Exception {
        Account customer = registerCustomer();
        Booking existing = booking(customer.id(), 1, "Room 1", "THAI", 60, D.atTime(11, 0), existingStatus);

        LocalDateTime start = D.atTime(from);
        LocalDateTime end = D.atTime(to);
        List<Booking> found = switch (query) {
            case "THERAPIST" -> bookingRepository.findConflictingTherapistBookings(
                    therapist(1).getId(), start, end, EXCLUDED);
            case "OTHER_THERAPIST" -> bookingRepository.findConflictingTherapistBookings(
                    therapist(2).getId(), start, end, EXCLUDED);
            default -> bookingRepository.findConflictingRoomBookingsWithCleaningBuffer(
                    room("Room 1").getId(), start, end, 15, EXCLUDED);
        };

        assertThat(found).as(tc).hasSize(expected);
        if (expected == 1) {
            assertThat(found.get(0).getId()).isEqualTo(existing.getId());
        }
    }
}
