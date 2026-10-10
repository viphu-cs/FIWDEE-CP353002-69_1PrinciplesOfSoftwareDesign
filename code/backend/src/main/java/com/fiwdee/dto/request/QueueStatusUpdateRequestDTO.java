package com.fiwdee.dto.request;

import com.fiwdee.domain.enums.QueueStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/** Request payload for a receptionist-initiated queue status change. */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class QueueStatusUpdateRequestDTO {

    @NotNull(message = "Queue status is required")
    private QueueStatus status;
}
