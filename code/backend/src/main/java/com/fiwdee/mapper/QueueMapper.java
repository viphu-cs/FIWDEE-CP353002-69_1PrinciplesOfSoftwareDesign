package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.dto.response.QueueItemResponseDTO;
import org.springframework.stereotype.Component;

/** Maps queue domain objects at the API boundary. */
@Component
public class QueueMapper {

    public QueueItemResponseDTO toResponseDTO(QueueItem queueItem) {
        if (queueItem == null) {
            return null;
        }
        Booking booking = queueItem.getBooking();
        return QueueItemResponseDTO.builder()
            .queueId(queueItem.getId())
            .bookingId(booking == null ? null : booking.getId())
            .queueNumber(queueItem.getQueueNumber())
            .queueDate(queueItem.getQueueDate())
            .checkInTime(queueItem.getCheckInTime())
            .calledTime(queueItem.getCalledTime())
            .queueStatus(queueItem.getQueueStatus())
            .priorityLevel(queueItem.getPriorityLevel())
            .customerName(booking == null || booking.getCustomer() == null ? null : booking.getCustomer().getFullName())
            .therapistName(booking == null || booking.getTherapist() == null ? null : booking.getTherapist().getFullName())
            .serviceName(booking == null || booking.getService() == null ? null : booking.getService().getServiceName())
            .roomNumber(booking == null || booking.getRoom() == null ? null : booking.getRoom().getRoomNumber())
            .scheduledStartDateTime(booking == null ? null : booking.getStartDateTime())
            .build();
    }
}
