package com.fiwdee.service;

import com.fiwdee.domain.entity.QueueItem;
import java.util.List;

/** Application boundary for the therapist's service lifecycle actions. */
public interface TherapistExecutionService {

    List<QueueItem> getMySchedule(Long therapistId);

    QueueItem startService(Long queueId, Long therapistId);

    QueueItem completeService(Long queueId, Long therapistId);
}
