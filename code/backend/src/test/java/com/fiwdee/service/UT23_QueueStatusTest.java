package com.fiwdee.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.domain.enums.QueueStatus;
import com.fiwdee.exception.ValidationException;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

/** UT23 – QueueServiceImpl.updateQueueStatus (Extended Entry DT แบบตารางสถานะ 5 × 5) */
@DisplayName("UT23 updateQueueStatus – State Transition Table")
class UT23_QueueStatusTest extends QueueTestBase {

    /** expected: SAME = คืนคิวเดิมไม่ save, OK = เปลี่ยนสถานะ, INVALID = ValidationException */
    @ParameterizedTest(name = "{0}: {1} → {2} = {3}")
    @CsvSource({
        "UT23-TC001, WAITING,    WAITING,    SAME",
        "UT23-TC002, WAITING,    CALLED,     OK",
        "UT23-TC003, WAITING,    IN_SERVICE, INVALID",
        "UT23-TC004, WAITING,    COMPLETED,  INVALID",
        "UT23-TC005, WAITING,    CANCELLED,  OK",
        "UT23-TC006, CALLED,     WAITING,    INVALID",
        "UT23-TC007, CALLED,     CALLED,     SAME",
        "UT23-TC008, CALLED,     IN_SERVICE, OK",
        "UT23-TC009, CALLED,     COMPLETED,  INVALID",
        "UT23-TC010, CALLED,     CANCELLED,  OK",
        "UT23-TC011, IN_SERVICE, WAITING,    INVALID",
        "UT23-TC012, IN_SERVICE, CALLED,     INVALID",
        "UT23-TC013, IN_SERVICE, IN_SERVICE, SAME",
        "UT23-TC014, IN_SERVICE, COMPLETED,  OK",
        "UT23-TC015, IN_SERVICE, CANCELLED,  INVALID",
        "UT23-TC016, COMPLETED,  WAITING,    INVALID",
        "UT23-TC017, COMPLETED,  CALLED,     INVALID",
        "UT23-TC018, COMPLETED,  IN_SERVICE, INVALID",
        "UT23-TC019, COMPLETED,  COMPLETED,  SAME",
        "UT23-TC020, COMPLETED,  CANCELLED,  INVALID",
        "UT23-TC021, CANCELLED,  WAITING,    INVALID",
        "UT23-TC022, CANCELLED,  CALLED,     INVALID",
        "UT23-TC023, CANCELLED,  IN_SERVICE, INVALID",
        "UT23-TC024, CANCELLED,  COMPLETED,  INVALID",
        "UT23-TC025, CANCELLED,  CANCELLED,  SAME"
    })
    void transition(String tc, QueueStatus from, QueueStatus to, String expected) {
        QueueItem q = queue(1, null, "Q001", from);
        when(queueItemRepository.findDetailedById(1L)).thenReturn(Optional.of(q));
        stubQueueSave();

        switch (expected) {
            case "SAME" -> {
                assertThat(queueService.updateQueueStatus(1L, to)).isSameAs(q);
                verify(queueItemRepository, never()).save(any());
            }
            case "OK" -> {
                queueService.updateQueueStatus(1L, to);
                assertThat(q.getQueueStatus()).isEqualTo(to);
                verify(queueItemRepository, times(1)).save(q);
                if (to == QueueStatus.CALLED) {
                    assertThat(q.getCalledTime()).isNotNull();
                }
            }
            default -> {
                ValidationException ex = assertThrows(ValidationException.class, () -> queueService.updateQueueStatus(1L, to));
                assertThat(ex.getMessage()).contains(from.name()).contains(to.name());
                assertThat(q.getQueueStatus()).isEqualTo(from);
            }
        }
    }

    @Test
    @DisplayName("UT23-TC026 status = null → ValidationException")
    void tc026() {
        assertThrows(ValidationException.class, () -> queueService.updateQueueStatus(1L, null));
    }
}
