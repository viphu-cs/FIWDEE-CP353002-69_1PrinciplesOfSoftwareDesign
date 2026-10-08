package com.fiwdee.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Report summarizing therapist work hours and derived commission earnings (UC-21).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TherapistCommissionReportDTO {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalCommissionsPaid;
    private Long totalMassagesPerformed;
    private List<TherapistCommissionItemDTO> therapistSummaries;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TherapistCommissionItemDTO {
        private Long therapistId;
        private String therapistName;
        private String nickname;
        private BigDecimal commissionRate; // e.g. 0.40 (40%)
        private Long completedServicesCount;
        private Integer totalDurationMinutes;
        private BigDecimal totalServiceRevenue;
        private BigDecimal commissionEarned;
    }
}
