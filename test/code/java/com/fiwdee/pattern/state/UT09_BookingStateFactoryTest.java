package com.fiwdee.pattern.state;

import static org.assertj.core.api.Assertions.assertThat;

import com.fiwdee.domain.enums.BookingStatus;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

/** UT09 – BookingStateFactory.getState (Strong Normal EC: ทุกค่าใน enum + null) */
@DisplayName("UT09 BookingStateFactory – Strong Normal EC")
class UT09_BookingStateFactoryTest {

    private static final Map<BookingStatus, Class<? extends BookingState>> EXPECTED = Map.of(
            BookingStatus.PENDING, PendingState.class,
            BookingStatus.CONFIRMED, ConfirmedState.class,
            BookingStatus.CHECKED_IN, CheckedInState.class,
            BookingStatus.IN_SERVICE, InServiceState.class,
            BookingStatus.COMPLETED, CompletedState.class,
            BookingStatus.CANCELLED, CancelledState.class,
            BookingStatus.NO_SHOW, NoShowState.class);

    /** UT09-TC001 ถึง TC007 ตามลำดับใน enum */
    @ParameterizedTest(name = "UT09-TC00{index} status = {0}")
    @EnumSource(BookingStatus.class)
    void everyStatusHasItsOwnState(BookingStatus status) {
        BookingState state = BookingStateFactory.getState(status);

        assertThat(state).isInstanceOf(EXPECTED.get(status));
        assertThat(state.getStatus()).isEqualTo(status);
    }

    @Test
    @DisplayName("UT09-TC008 status = null → PendingState")
    void nullStatusDefaultsToPending() {
        assertThat(BookingStateFactory.getState(null)).isInstanceOf(PendingState.class);
    }
}
