package com.fiwdee.dto.request;

import com.fiwdee.domain.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for processing a booking payment.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentRequestDTO {

    private Long bookingId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    /**
     * Optional promotional code (e.g. "FIWDEE20").
     */
    private String promoCode;

    /**
     * Optional staff station or transaction note.
     */
    private String transactionNote;
}
