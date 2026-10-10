package com.fiwdee.dto.response;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DurationOptionDTO {
    private Long id;
    private Integer durationMinutes;
    private BigDecimal price;

    public DurationOptionDTO(Integer durationMinutes, BigDecimal price) {
        this.id = null;
        this.durationMinutes = durationMinutes;
        this.price = price;
    }
}
