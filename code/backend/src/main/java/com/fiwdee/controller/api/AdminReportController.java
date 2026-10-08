package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.response.DashboardSummaryDTO;
import com.fiwdee.dto.response.RevenueReportDTO;
import com.fiwdee.dto.response.TherapistCommissionReportDTO;
import com.fiwdee.service.ReportService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for Owner financial reports, business statistics and dashboards (UC-21, UC-22).
 */
@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final ReportService reportService;

    /**
     * Executive business dashboard summary.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardSummaryDTO>> getDashboardSummary() {
        DashboardSummaryDTO summary = reportService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("ดึงข้อมูลสรุปแดชบอร์ดสำเร็จ", summary));
    }

    /**
     * Financial revenue breakdown by date range.
     */
    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportDTO>> getRevenueReport(
            @RequestParam(name = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.withDayOfMonth(1); // Default to start of current month
        }

        RevenueReportDTO report = reportService.getRevenueReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("ดึงรายงานรายได้สำเร็จ", report));
    }

    /**
     * Therapist working hours and commission breakdown by date range.
     */
    @GetMapping("/commissions")
    public ResponseEntity<ApiResponse<TherapistCommissionReportDTO>> getTherapistCommissionReport(
            @RequestParam(name = "startDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        if (endDate == null) {
            endDate = LocalDate.now();
        }
        if (startDate == null) {
            startDate = endDate.withDayOfMonth(1);
        }

        TherapistCommissionReportDTO report = reportService.getTherapistCommissionReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("ดึงรายงานค่าคอมมิชชันหมอนวดสำเร็จ", report));
    }
}
