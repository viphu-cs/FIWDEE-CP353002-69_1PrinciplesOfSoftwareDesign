package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockingDetails;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.service.impl.TherapistExecutionServiceImpl;
import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.pattern.observer.BookingStatusChangedEvent;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.testsupport.TestData;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;

/** UT24 – TherapistExecutionServiceImpl.startService / completeService (Decision Table, Extended Entry) */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT24 TherapistExecutionService – Decision Table")
class UT24_TherapistExecutionTest {

    @Mock QueueService queueService;
    @Mock BookingRepository bookingRepository;
    @Mock ApplicationEventPublisher eventPublisher;
    @InjectMocks TherapistExecutionServiceImpl service;

    private Booking booking;
    private Room room;

    private QueueItem given(BookingStatus bookingStatus, QueueStatus queueStatus) {
        room = TestData.room(101, "R101", RoomType.SINGLE, true);
        booking = TestData.booking(10, TestData.customer(1), TestData.therapist(5, "มะลิ", true), room, null, null,
                TestData.DAY.atTime(15, 30), 60, bookingStatus);
        QueueItem q = new QueueItem();
        q.setId(1L);
        q.setBooking(booking);
        q.setQueueNumber("Q001");
        q.setQueueStatus(queueStatus);
        when(queueService.getQueueItem(1L)).thenReturn(q);
        when(queueService.updateQueueStatus(any(), any())).thenReturn(q);
        return q;
    }

    private List<BookingStatusChangedEvent> events() {
        return mockingDetails(eventPublisher).getInvocations().stream()
                .map(i -> i.getArguments()[0])
                .filter(BookingStatusChangedEvent.class::isInstance)
                .map(BookingStatusChangedEvent.class::cast)
                .toList();
    }

    private void assertRejected(Runnable call, BookingStatus unchanged) {
        assertThrows(ValidationException.class, call::run);
        assertThat(booking.getStatus()).isEqualTo(unchanged);
        verify(bookingRepository, never()).save(any());
        assertThat(events()).isEmpty();
    }

    @Test
    @DisplayName("UT24-TC001 [R1] START โดยหมอนวดที่ไม่ได้รับคิว → ValidationException")
    void tc001() {
        given(BookingStatus.CHECKED_IN, QueueStatus.CALLED);
        assertRejected(() -> service.startService(1L, 8L), BookingStatus.CHECKED_IN);
    }

    @Test
    @DisplayName("UT24-TC002 [R1] START therapistId = null → ValidationException")
    void tc002() {
        given(BookingStatus.CHECKED_IN, QueueStatus.CALLED);
        assertRejected(() -> service.startService(1L, null), BookingStatus.CHECKED_IN);
    }

    @Test
    @DisplayName("UT24-TC003 [R2] START แต่ booking ยังไม่ CHECKED_IN → ValidationException")
    void tc003() {
        given(BookingStatus.CONFIRMED, QueueStatus.CALLED);
        assertRejected(() -> service.startService(1L, 5L), BookingStatus.CONFIRMED);
    }

    @Test
    @DisplayName("UT24-TC004 [R3] START แต่คิวยังไม่ถูกเรียก → ValidationException")
    void tc004() {
        given(BookingStatus.CHECKED_IN, QueueStatus.WAITING);
        assertRejected(() -> service.startService(1L, 5L), BookingStatus.CHECKED_IN);
    }

    @Test
    @DisplayName("UT24-TC005 [R4] START สำเร็จ → IN_SERVICE, ห้อง OCCUPIED, คิว IN_SERVICE, publish event")
    void tc005() {
        given(BookingStatus.CHECKED_IN, QueueStatus.CALLED);

        service.startService(1L, 5L);

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.IN_SERVICE);
        assertThat(booking.getActualStartTime()).isNotNull();
        assertThat(room.getRoomStatus()).isEqualTo(RoomStatus.OCCUPIED);
        verify(bookingRepository).save(booking);
        verify(queueService).updateQueueStatus(1L, QueueStatus.IN_SERVICE);
        assertThat(events()).singleElement().satisfies(e -> {
            assertThat(e.getOldStatus()).isEqualTo(BookingStatus.CHECKED_IN);
            assertThat(e.getNewStatus()).isEqualTo(BookingStatus.IN_SERVICE);
        });
    }

    @Test
    @DisplayName("UT24-TC006 [R5] COMPLETE โดยหมอนวดที่ไม่ได้รับคิว → ValidationException")
    void tc006() {
        given(BookingStatus.IN_SERVICE, QueueStatus.IN_SERVICE);
        assertRejected(() -> service.completeService(1L, 8L), BookingStatus.IN_SERVICE);
    }

    @Test
    @DisplayName("UT24-TC007 [R6] COMPLETE แต่คิวยังไม่ IN_SERVICE → ValidationException")
    void tc007() {
        given(BookingStatus.IN_SERVICE, QueueStatus.CALLED);
        assertRejected(() -> service.completeService(1L, 5L), BookingStatus.IN_SERVICE);
    }

    @Test
    @DisplayName("UT24-TC008 [R7] COMPLETE สำเร็จ → COMPLETED, ห้อง CLEANING, คิว COMPLETED, publish event")
    void tc008() {
        given(BookingStatus.IN_SERVICE, QueueStatus.IN_SERVICE);

        service.completeService(1L, 5L);

        assertThat(booking.getStatus()).isEqualTo(BookingStatus.COMPLETED);
        assertThat(booking.getActualEndTime()).isNotNull();
        assertThat(room.getRoomStatus()).isEqualTo(RoomStatus.CLEANING);
        verify(queueService).updateQueueStatus(1L, QueueStatus.COMPLETED);
        assertThat(events()).singleElement().satisfies(e ->
                assertThat(e.getNewStatus()).isEqualTo(BookingStatus.COMPLETED));
    }
}
