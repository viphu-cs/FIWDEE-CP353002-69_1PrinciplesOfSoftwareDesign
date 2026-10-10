package com.fiwdee.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mockingDetails;
import static org.mockito.Mockito.when;

import com.fiwdee.service.impl.QueueServiceImpl;
import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.pattern.observer.BookingStatusChangedEvent;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.QueueItemRepository;
import com.fiwdee.testsupport.TestData;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.context.ApplicationEventPublisher;

/** ฐานร่วม UT21–UT23 สำหรับ QueueServiceImpl */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
abstract class QueueTestBase {

    @Mock QueueItemRepository queueItemRepository;
    @Mock BookingRepository bookingRepository;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks QueueServiceImpl queueService;

    Booking booking(long id, LocalDateTime start, BookingStatus status) {
        Booking b = TestData.booking(id, TestData.customer(1), TestData.therapist(5, "มะลิ", true), null, null, null,
                start, 60, status);
        when(bookingRepository.findDetailedById(id)).thenReturn(Optional.of(b));
        return b;
    }

    QueueItem queue(long id, Booking b, String number, QueueStatus status) {
        QueueItem q = new QueueItem();
        q.setId(id);
        q.setBooking(b);
        q.setQueueNumber(number);
        q.setQueueStatus(status);
        return q;
    }

    void stubQueueSave() {
        when(queueItemRepository.save(any())).thenAnswer(i -> i.getArgument(0));
    }

    List<BookingStatusChangedEvent> events() {
        return mockingDetails(eventPublisher).getInvocations().stream()
                .filter(i -> i.getMethod().getName().equals("publishEvent"))
                .map(i -> i.getArguments()[0])
                .filter(BookingStatusChangedEvent.class::isInstance)
                .map(BookingStatusChangedEvent.class::cast)
                .toList();
    }
}
