package com.fiwdee.pattern.state;

import com.fiwdee.domain.enums.BookingStatus;
import java.util.EnumMap;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Factory providing flyweight/singleton instances of BookingState for each BookingStatus.
 */
@Component
public class BookingStateFactory {

    private static final Map<BookingStatus, BookingState> STATE_MAP = new EnumMap<>(BookingStatus.class);

    static {
        STATE_MAP.put(BookingStatus.PENDING, new PendingState());
        STATE_MAP.put(BookingStatus.CONFIRMED, new ConfirmedState());
        STATE_MAP.put(BookingStatus.CHECKED_IN, new CheckedInState());
        STATE_MAP.put(BookingStatus.IN_SERVICE, new InServiceState());
        STATE_MAP.put(BookingStatus.COMPLETED, new CompletedState());
        STATE_MAP.put(BookingStatus.CANCELLED, new CancelledState());
        STATE_MAP.put(BookingStatus.NO_SHOW, new NoShowState());
    }

    /**
     * Resolves the concrete BookingState corresponding to the given BookingStatus.
     */
    public static BookingState getState(BookingStatus status) {
        if (status == null) {
            return STATE_MAP.get(BookingStatus.PENDING);
        }
        BookingState state = STATE_MAP.get(status);
        if (state == null) {
            throw new IllegalArgumentException("Unsupported booking status: " + status);
        }
        return state;
    }
}
