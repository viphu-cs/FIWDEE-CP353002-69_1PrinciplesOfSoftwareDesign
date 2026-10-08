package com.fiwdee.service;

import com.fiwdee.dto.response.DashboardSummaryDTO;
import com.fiwdee.dto.response.RevenueReportDTO;
import com.fiwdee.dto.response.TherapistCommissionReportDTO;
import java.time.LocalDate;

/**
 * Service interface for generating financial reports and business dashboards (UC-21, UC-22, Task 3.1).
 */
public interface ReportService {

    /**
     * Retrieves overall executive dashboard summary for owner.
     */
    DashboardSummaryDTO getDashboardSummary();

    /**
     * Retrieves detailed revenue report for the specified date range.
     */
    RevenueReportDTO getRevenueReport(LocalDate startDate, LocalDate endDate);

    /**
     * Retrieves therapist commission earnings report for the specified date range.
     */
    TherapistCommissionReportDTO getTherapistCommissionReport(LocalDate startDate, LocalDate endDate);
}
