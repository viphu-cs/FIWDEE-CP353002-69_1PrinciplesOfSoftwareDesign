package com.fiwdee.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Request payload for validating promotional codes and getting server-side discount quotation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ValidatePromoRequestDTO {

    @NotBlank(message = "Promo code is required")
    private String promoCode;

    @NotNull(message = "Gross amount is required")
    @DecimalMin(value = "0.01", message = "Gross amount must be greater than zero")
    private BigDecimal grossAmount;

    private Long serviceId;
}
