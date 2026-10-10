package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.dto.response.BookingResponseDTO;
import com.fiwdee.dto.response.MyBookingResponseDTO;
import java.util.List;
import org.springframework.stereotype.Component;

/**
 * Maps Booking entities to response DTOs for customer-facing history and detailed booking views.
 */
@Component
public class BookingMapper {

    public MyBookingResponseDTO toMyBookingResponse(Booking booking) {
        if (booking == null) {
            return null;
        }
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
                .discountAmount(booking.getPayment() != null ? booking.getPayment().getDiscountAmount() : java.math.BigDecimal.ZERO)
                .netAmount(booking.getPayment() != null ? booking.getPayment().getNetAmount() : booking.getTotalPrice())
                .paymentStatus(booking.getPayment() != null && booking.getPayment().getPaymentStatus() != null
                        ? booking.getPayment().getPaymentStatus().name()
                        : null)
                .status(booking.getStatus() != null ? booking.getStatus().name() : null)
                .createdAt(booking.getCreatedAt())
                .build();
    }

    public List<MyBookingResponseDTO> toMyBookingResponses(List<Booking> bookings) {
        if (bookings == null) {
            return List.of();
        }
        return bookings.stream()
                .map(this::toMyBookingResponse)
                .toList();
    }

    public BookingResponseDTO toBookingResponse(Booking booking) {
        if (booking == null) {
            return null;
        }
        return BookingResponseDTO.builder()
                .id(booking.getId())
                .bookingReferenceCode(booking.getBookingReferenceCode())
                .customerId(booking.getCustomer() != null ? booking.getCustomer().getId() : null)
                .customerName(booking.getCustomer() != null ? booking.getCustomer().getFullName() : null)
                .customerPhone(booking.getCustomer() != null ? booking.getCustomer().getPhoneNumber() : null)
                .serviceId(booking.getService() != null ? booking.getService().getId() : null)
                .serviceName(booking.getService() != null ? booking.getService().getServiceName() : null)
                .durationOptionId(booking.getDurationOption() != null ? booking.getDurationOption().getId() : null)
                .durationMinutes(booking.getDurationOption() != null
                        ? booking.getDurationOption().getDurationMinutes()
                        : null)
                .totalPrice(booking.getTotalPrice())
                .therapistId(booking.getTherapist() != null ? booking.getTherapist().getId() : null)
                .therapistName(booking.getTherapist() != null ? booking.getTherapist().getFullName() : null)
                .roomId(booking.getRoom() != null ? booking.getRoom().getId() : null)
                .roomNumber(booking.getRoom() != null ? booking.getRoom().getRoomNumber() : null)
                .roomType(booking.getRoom() != null && booking.getRoom().getRoomType() != null
                        ? booking.getRoom().getRoomType().name()
                        : null)
                .startDateTime(booking.getStartDateTime())
                .endDateTime(booking.getEndDateTime())
                .status(booking.getStatus())
                .bookingChannel(booking.getBookingChannel())
                .specialNotes(booking.getSpecialNotes())
                .actualStartTime(booking.getActualStartTime())
                .actualEndTime(booking.getActualEndTime())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }

    public List<BookingResponseDTO> toBookingResponses(List<Booking> bookings) {
        if (bookings == null) {
            return List.of();
        }
        return bookings.stream()
                .map(this::toBookingResponse)
                .toList();
    }
}
