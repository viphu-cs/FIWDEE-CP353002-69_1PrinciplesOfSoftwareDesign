package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Shop;
import com.fiwdee.dto.response.PaymentResponseDTO;
import com.fiwdee.dto.response.ReceiptResponseDTO;
import org.springframework.stereotype.Component;

/**
 * Mapper for Payment entity and presentation DTOs.
 */
@Component
public class PaymentMapper {

    public PaymentResponseDTO toResponseDTO(Payment payment) {
        if (payment == null) {
            return null;
        }

        String receptionistName = null;
        if (payment.getReceptionist() != null) {
            receptionistName = payment.getReceptionist().getFullName();
        }

        Long bookingId = null;
        String bookingRef = null;
        if (payment.getBooking() != null) {
            bookingId = payment.getBooking().getId();
            bookingRef = payment.getBooking().getBookingReferenceCode();
        }

        return PaymentResponseDTO.builder()
                .paymentId(payment.getId())
                .bookingId(bookingId)
                .bookingReferenceCode(bookingRef)
                .paymentReferenceCode(payment.getPaymentReferenceCode())
                .receiptNumber(payment.getReceiptNumber())
                .grossAmount(payment.getGrossAmount())
                .discountAmount(payment.getDiscountAmount())
                .netAmount(payment.getNetAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .paidAt(payment.getPaidAt())
                .transactionNote(payment.getTransactionNote())
                .receptionistName(receptionistName)
                .build();
    }

    public ReceiptResponseDTO toReceiptDTO(Payment payment, Shop shop) {
        if (payment == null) {
            return null;
        }

        Booking booking = payment.getBooking();
        String customerName = "Guest Customer";
        String customerPhone = "-";
        String serviceName = "-";
        Integer duration = 60;
        String therapistName = "-";
        String roomNumber = "-";

        if (booking != null) {
            if (booking.getCustomer() != null) {
                customerName = booking.getCustomer().getFullName();
                customerPhone = booking.getCustomer().getPhoneNumber();
            }
            if (booking.getService() != null) {
                serviceName = booking.getService().getServiceName();
            }
            if (booking.getDurationOption() != null) {
                duration = booking.getDurationOption().getDurationMinutes();
            }
            if (booking.getTherapist() != null) {
                therapistName = booking.getTherapist().getFullName();
            }
            if (booking.getRoom() != null) {
                roomNumber = booking.getRoom().getRoomNumber();
            }
        }

        String staffName = payment.getReceptionist() != null ? payment.getReceptionist().getFullName() : "System / Online";
        String shopName = shop != null ? shop.getShopName() : "FIWDEE Thai Massage";
        String shopAddress = shop != null ? shop.getAddress() : "-";
        String shopPhone = shop != null ? shop.getPhoneNumber() : "-";

        return ReceiptResponseDTO.builder()
                .receiptNumber(payment.getReceiptNumber())
                .paymentReferenceCode(payment.getPaymentReferenceCode())
                .bookingReferenceCode(booking != null ? booking.getBookingReferenceCode() : null)
                .customerName(customerName)
                .customerPhone(customerPhone)
                .serviceName(serviceName)
                .durationMinutes(duration)
                .therapistName(therapistName)
                .roomNumber(roomNumber)
                .serviceStartDateTime(booking != null ? booking.getStartDateTime() : null)
                .serviceEndDateTime(booking != null ? booking.getEndDateTime() : null)
                .grossAmount(payment.getGrossAmount())
                .discountAmount(payment.getDiscountAmount())
                .netAmount(payment.getNetAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paidAt(payment.getPaidAt())
                .issuedByStaff(staffName)
                .shopName(shopName)
                .shopAddress(shopAddress)
                .shopPhone(shopPhone)
                .build();
    }
}
