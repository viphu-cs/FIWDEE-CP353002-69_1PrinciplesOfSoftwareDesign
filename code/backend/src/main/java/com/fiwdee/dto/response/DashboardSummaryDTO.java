package com.fiwdee.dto.response;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Executive dashboard overview for shop owner (UC-22).
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardSummaryDTO {

    private BigDecimal todayRevenue;
    private BigDecimal monthlyRevenue;
    private Long todayBookingsCount;
    private Long monthlyBookingsCount;
    private Long completedBookingsCount;
    private Long cancelledBookingsCount;
    private BigDecimal totalDiscountGiven;
    private BigDecimal totalRefundAmount;
    private List<DailyRevenuePointDTO> recentDailyRevenues;
    private List<ServiceRevenueItemDTO> topServices;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyRevenuePointDTO {
        private String date; // YYYY-MM-DD
        private BigDecimal revenue;
        private Long bookingCount;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceRevenueItemDTO {
        private String serviceName;
        private Long bookingCount;
        private BigDecimal totalRevenue;
    }
}
