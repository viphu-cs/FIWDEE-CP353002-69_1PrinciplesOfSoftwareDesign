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
 * Detailed financial revenue report for a specified date range (UC-22).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueReportDTO {

    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal grossTotal;
    private BigDecimal discountTotal;
    private BigDecimal netRevenue;
    private BigDecimal refundedTotal;
    private Long totalCompletedBookings;
    private List<RevenueByMethodDTO> breakdownByPaymentMethod;
    private List<RevenueByServiceDTO> breakdownByService;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueByMethodDTO {
        private String paymentMethod;
        private Long transactionCount;
        private BigDecimal totalAmount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RevenueByServiceDTO {
        private String serviceName;
        private Long bookingCount;
        private BigDecimal revenue;
    }
}
