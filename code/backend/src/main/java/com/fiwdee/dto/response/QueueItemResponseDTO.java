package com.fiwdee.dto.response;

import com.fiwdee.domain.enums.QueueStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

/** Queue information rendered by the front-desk and therapist views. */
@Getter
@Builder
public class QueueItemResponseDTO {

    private final Long queueId;
    private final Long bookingId;
    private final String queueNumber;
    private final LocalDate queueDate;
    private final LocalDateTime checkInTime;
    private final LocalDateTime calledTime;
    private final QueueStatus queueStatus;
    private final Integer priorityLevel;
    private final String customerName;
    private final String therapistName;
    private final String serviceName;
    private final String roomNumber;
    private final LocalDateTime scheduledStartDateTime;
}
