package com.fiwdee.pattern.observer;

import com.fiwdee.domain.enums.BookingStatus;
import java.time.LocalDateTime;
import lombok.Getter;

/**
 * Domain event published after a booking lifecycle transition succeeds.
 * Spring accepts plain objects as application events, avoiding inheritance coupling.
 */
@Getter
public final class BookingStatusChangedEvent {

    private final Object source;
    private final Long bookingId;
    private final BookingStatus oldStatus;
    private final BookingStatus newStatus;
    private final LocalDateTime timestamp;

    public BookingStatusChangedEvent(
        Object source,
        Long bookingId,
        BookingStatus oldStatus,
        BookingStatus newStatus
    ) {
        this.source = source;
        this.bookingId = bookingId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.timestamp = LocalDateTime.now();
    }
}
