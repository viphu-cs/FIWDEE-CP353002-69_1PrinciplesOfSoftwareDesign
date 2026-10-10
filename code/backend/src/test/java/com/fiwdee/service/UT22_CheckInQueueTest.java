package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.CALLS_REAL_METHODS;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.exception.ValidationException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

/** UT22 – QueueServiceImpl: สถานะ booking ตอน check-in และเลขคิว (Weak Robust EC) */
@DisplayName("UT22 QueueServiceImpl – check-in & queue number EC")
class UT22_CheckInQueueTest extends QueueTestBase {

    private static final LocalDateTime START = LocalDateTime.of(2026, 11, 2, 14, 0);
    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 2, 13, 50);
    private static final LocalDate DATE = START.toLocalDate();

    private QueueItem checkInFrozen(long bookingId) {
        try (MockedStatic<LocalDateTime> time = mockStatic(LocalDateTime.class, CALLS_REAL_METHODS)) {
            time.when(LocalDateTime::now).thenReturn(NOW);
            return queueService.checkInBooking(bookingId);
        }
    }

    @Test
    @DisplayName("UT22-TC001 (V1) booking CONFIRMED → CHECKED_IN + publish event")
    void tc001() {
        Booking b = booking(10, START, BookingStatus.CONFIRMED);
        when(queueItemRepository.findDetailedByBookingId(10L)).thenReturn(Optional.of(queue(1, b, "Q001", QueueStatus.WAITING)));

        checkInFrozen(10L);

        assertThat(b.getStatus()).isEqualTo(BookingStatus.CHECKED_IN);
        verify(bookingRepository).save(b);
        assertThat(events()).singleElement().satisfies(e -> {
            assertThat(e.getOldStatus()).isEqualTo(BookingStatus.CONFIRMED);
            assertThat(e.getNewStatus()).isEqualTo(BookingStatus.CHECKED_IN);
        });
    }

    @Test
    @DisplayName("UT22-TC002 (V2) CHECKED_IN และมีคิวแล้ว → คืนคิวเดิม ไม่สร้างใหม่ ไม่ publish")
    void tc002() {
        Booking b = booking(10, START, BookingStatus.CHECKED_IN);
        QueueItem q2 = queue(2, b, "Q002", QueueStatus.WAITING);
        when(queueItemRepository.existsByBookingId(10L)).thenReturn(true);
        when(queueItemRepository.findDetailedByBookingId(10L)).thenReturn(Optional.of(q2));

        QueueItem result = checkInFrozen(10L);

        assertThat(result).isSameAs(q2);
        verify(queueItemRepository, never()).save(any());
        assertThat(events()).isEmpty();
    }

    @Test
    @DisplayName("UT22-TC003 (V3) CHECKED_IN แต่ยังไม่มีคิว → สร้างคิว WAITING priority 0")
    void tc003() {
        booking(10, START, BookingStatus.CHECKED_IN);
        when(queueItemRepository.existsByBookingId(10L)).thenReturn(false);
        when(queueItemRepository.findByQueueDateOrderByPriorityLevelDescCheckInTimeAsc(DATE)).thenReturn(List.of());
        stubQueueSave();

        QueueItem result = checkInFrozen(10L);

        assertThat(result.getQueueStatus()).isEqualTo(QueueStatus.WAITING);
        assertThat(result.getPriorityLevel()).isZero();
        assertThat(result.getQueueDate()).isEqualTo(DATE);
    }

    @Test
    @DisplayName("UT22-TC004 (V4) วันนั้นยังไม่มีคิว → Q001")
    void tc004() {
        Booking b = booking(10, START, BookingStatus.CHECKED_IN);
        when(queueItemRepository.findByQueueDateOrderByPriorityLevelDescCheckInTimeAsc(DATE)).thenReturn(List.of());
        stubQueueSave();

        assertThat(queueService.generateQueueItem(b).getQueueNumber()).isEqualTo("Q001");
    }

    @Test
    @DisplayName("UT22-TC005 (V5) มี Q001–Q003 → Q004")
    void tc005() {
        Booking b = booking(10, START, BookingStatus.CHECKED_IN);
        when(queueItemRepository.findByQueueDateOrderByPriorityLevelDescCheckInTimeAsc(DATE)).thenReturn(List.of(
                queue(1, null, "Q001", QueueStatus.COMPLETED),
                queue(2, null, "Q002", QueueStatus.IN_SERVICE),
                queue(3, null, "Q003", QueueStatus.WAITING)));
        stubQueueSave();

        assertThat(queueService.generateQueueItem(b).getQueueNumber()).isEqualTo("Q004");
    }

    @Test
    @DisplayName("UT22-TC006 (V6) มี Q001 และเลขคิวผิดรูปแบบ (null, \"QX\") → Q002")
    void tc006() {
        Booking b = booking(10, START, BookingStatus.CHECKED_IN);
        when(queueItemRepository.findByQueueDateOrderByPriorityLevelDescCheckInTimeAsc(DATE)).thenReturn(List.of(
                queue(1, null, "Q001", QueueStatus.WAITING),
                queue(2, null, null, QueueStatus.WAITING),
                queue(3, null, "QX", QueueStatus.WAITING)));
        stubQueueSave();

        assertThat(queueService.generateQueueItem(b).getQueueNumber()).isEqualTo("Q002");
    }

    @Test
    @DisplayName("UT22-TC007 (I1) ไม่พบ booking → NotFoundException")
    void tc007() {
        when(bookingRepository.findDetailedById(999L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> queueService.checkInBooking(999L));
    }

    @Test
    @DisplayName("UT22-TC008 (I2) booking PENDING → ValidationException")
    void tc008() {
        Booking b = booking(10, START, BookingStatus.PENDING);
        assertThrows(ValidationException.class, () -> checkInFrozen(10L));
        assertThat(b.getStatus()).isEqualTo(BookingStatus.PENDING);
    }

    @Test
    @DisplayName("UT22-TC009 (I3) generateQueueItem กับ booking ที่ยังไม่ check-in → ValidationException")
    void tc009() {
        Booking b = booking(10, START, BookingStatus.CONFIRMED);
        assertThrows(ValidationException.class, () -> queueService.generateQueueItem(b));
    }

    @Test
    @DisplayName("UT22-TC010 (I4) callNextQueue ไม่มีคิว WAITING → NotFoundException")
    void tc010() {
        when(queueItemRepository.findFirstByQueueDateAndQueueStatusOrderByPriorityLevelDescCheckInTimeAsc(
                any(), eq(QueueStatus.WAITING))).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> queueService.callNextQueue());
    }
}
