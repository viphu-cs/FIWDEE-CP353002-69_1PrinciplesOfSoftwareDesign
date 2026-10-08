package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.dto.response.MyBookingResponseDTO;
import java.util.List;
import org.springframework.stereotype.Component;

/** Maps Booking entities to the customer-facing history DTO. */
@Component
public class BookingMapper {

    public MyBookingResponseDTO toMyBookingResponse(Booking booking) {
        return MyBookingResponseDTO.builder()
                .id(booking.getId())
                .bookingReferenceCode(booking.getBookingReferenceCode())
                .serviceName(booking.getService() != null ? booking.getService().getServiceName() : null)
                .therapistName(booking.getTherapist() != null ? booking.getTherapist().getFullName() : null)
                .roomNumber(booking.getRoom() != null ? booking.getRoom().getRoomNumber() : null)
                .durationMinutes(booking.getDurationOption() != null
                        ? booking.getDurationOption().getDurationMinutes()
                        : null)
                .startDateTime(booking.getStartDateTime())
                .endDateTime(booking.getEndDateTime())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public List<MyBookingResponseDTO> toMyBookingResponses(List<Booking> bookings) {
        return bookings.stream()
                .map(this::toMyBookingResponse)
                .toList();
    }
}
