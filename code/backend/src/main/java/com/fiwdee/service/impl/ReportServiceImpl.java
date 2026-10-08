package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Booking;
import com.fiwdee.domain.entity.Payment;
import com.fiwdee.domain.entity.Refund;
import com.fiwdee.domain.entity.Therapist;
import com.fiwdee.domain.enums.BookingStatus;
import com.fiwdee.domain.enums.RefundStatus;
import com.fiwdee.dto.response.DashboardSummaryDTO;
import com.fiwdee.dto.response.RevenueReportDTO;
import com.fiwdee.dto.response.TherapistCommissionReportDTO;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.PaymentRepository;
import com.fiwdee.repository.RefundRepository;
import com.fiwdee.repository.TherapistRepository;
import com.fiwdee.service.ReportService;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of ReportService for business dashboards, financial aggregation,
 * and therapist commission calculations (UC-21, UC-22).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ReportServiceImpl implements ReportService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final RefundRepository refundRepository;
    private final TherapistRepository therapistRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getDashboardSummary() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.atTime(LocalTime.MAX);

        LocalDate firstDayOfMonth = today.withDayOfMonth(1);
        LocalDateTime startOfMonth = firstDayOfMonth.atStartOfDay();

        // 1. Today's payments
        List<Payment> todayPayments = paymentRepository.findCompletedPaymentsBetween(startOfToday, endOfToday);
        BigDecimal todayRevenue = todayPayments.stream()
                .map(Payment::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 2. Month's payments
        List<Payment> monthPayments = paymentRepository.findCompletedPaymentsBetween(startOfMonth, endOfToday);
        BigDecimal monthlyRevenue = monthPayments.stream()
                .map(Payment::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalDiscountGiven = monthPayments.stream()
                .map(Payment::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Today's and monthly bookings
        List<Booking> todayBookings = bookingRepository.findBookingsByDate(startOfToday, endOfToday);
        long todayBookingsCount = todayBookings.size();

        List<Booking> allBookings = bookingRepository.findAll();
        long monthlyBookingsCount = allBookings.stream()
                .filter(b -> b.getStartDateTime() != null && b.getStartDateTime().isAfter(startOfMonth))
                .count();

        long completedCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.COMPLETED)
                .count();

        long cancelledCount = allBookings.stream()
                .filter(b -> b.getStatus() == BookingStatus.CANCELLED || b.getStatus() == BookingStatus.NO_SHOW)
                .count();

        // 4. Total refunds
        List<Refund> allRefunds = refundRepository.findAll();
        BigDecimal totalRefundAmount = allRefunds.stream()
                .filter(r -> r.getStatus() == RefundStatus.COMPLETED)
                .map(Refund::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5. Recent 7 Days Revenue Trend
        LocalDate sevenDaysAgo = today.minusDays(6);
        LocalDateTime startOfSevenDays = sevenDaysAgo.atStartOfDay();
        List<Payment> recentPayments = paymentRepository.findCompletedPaymentsBetween(startOfSevenDays, endOfToday);

        Map<LocalDate, BigDecimal> dailyRevenueMap = new TreeMap<>();
        Map<LocalDate, Long> dailyCountMap = new HashMap<>();
        for (int i = 0; i < 7; i++) {
            LocalDate d = sevenDaysAgo.plusDays(i);
            dailyRevenueMap.put(d, BigDecimal.ZERO);
            dailyCountMap.put(d, 0L);
        }

        for (Payment p : recentPayments) {
            if (p.getPaidAt() != null) {
                LocalDate dateKey = p.getPaidAt().toLocalDate();
                dailyRevenueMap.put(dateKey, dailyRevenueMap.getOrDefault(dateKey, BigDecimal.ZERO).add(p.getNetAmount()));
                dailyCountMap.put(dateKey, dailyCountMap.getOrDefault(dateKey, 0L) + 1);
            }
        }

        List<DashboardSummaryDTO.DailyRevenuePointDTO> dailyPoints = dailyRevenueMap.entrySet().stream()
                .map(entry -> DashboardSummaryDTO.DailyRevenuePointDTO.builder()
                        .date(entry.getKey().format(DateTimeFormatter.ISO_LOCAL_DATE))
                        .revenue(entry.getValue())
                        .bookingCount(dailyCountMap.getOrDefault(entry.getKey(), 0L))
                        .build())
                .collect(Collectors.toList());

        // 6. Top Services
        Map<String, List<Payment>> paymentsByService = monthPayments.stream()
                .filter(p -> p.getBooking() != null && p.getBooking().getService() != null)
                .collect(Collectors.groupingBy(p -> p.getBooking().getService().getServiceName()));

        List<DashboardSummaryDTO.ServiceRevenueItemDTO> topServices = paymentsByService.entrySet().stream()
                .map(entry -> DashboardSummaryDTO.ServiceRevenueItemDTO.builder()
                        .serviceName(entry.getKey())
                        .bookingCount((long) entry.getValue().size())
                        .totalRevenue(entry.getValue().stream()
                                .map(Payment::getNetAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .sorted((a, b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .limit(5)
                .collect(Collectors.toList());

        return DashboardSummaryDTO.builder()
                .todayRevenue(todayRevenue)
                .monthlyRevenue(monthlyRevenue)
                .todayBookingsCount(todayBookingsCount)
                .monthlyBookingsCount(monthlyBookingsCount)
                .completedBookingsCount(completedCount)
                .cancelledBookingsCount(cancelledCount)
                .totalDiscountGiven(totalDiscountGiven)
                .totalRefundAmount(totalRefundAmount)
                .recentDailyRevenues(dailyPoints)
                .topServices(topServices)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public RevenueReportDTO getRevenueReport(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new ValidationException("Start date and end date must not be null");
        }
        if (startDate.isAfter(endDate)) {
            throw new ValidationException("Start date must be before or equal to end date");
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Payment> payments = paymentRepository.findCompletedPaymentsBetween(startDateTime, endDateTime);

        BigDecimal grossTotal = payments.stream()
                .map(Payment::getGrossAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountTotal = payments.stream()
                .map(Payment::getDiscountAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netRevenue = payments.stream()
                .map(Payment::getNetAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Sum refunds within range
        List<Refund> refunds = refundRepository.findAll().stream()
                .filter(r -> r.getRefundedAt() != null 
                        && !r.getRefundedAt().isBefore(startDateTime) 
                        && !r.getRefundedAt().isAfter(endDateTime)
                        && r.getStatus() == RefundStatus.COMPLETED)
                .collect(Collectors.toList());

        BigDecimal refundedTotal = refunds.stream()
                .map(Refund::getRefundAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Breakdown by Payment Method
        Map<String, List<Payment>> byMethod = payments.stream()
                .collect(Collectors.groupingBy(p -> p.getPaymentMethod().name()));

        List<RevenueReportDTO.RevenueByMethodDTO> breakdownByMethod = byMethod.entrySet().stream()
                .map(e -> RevenueReportDTO.RevenueByMethodDTO.builder()
                        .paymentMethod(e.getKey())
                        .transactionCount((long) e.getValue().size())
                        .totalAmount(e.getValue().stream().map(Payment::getNetAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .collect(Collectors.toList());

        // Breakdown by Service
        Map<String, List<Payment>> byService = payments.stream()
                .filter(p -> p.getBooking() != null && p.getBooking().getService() != null)
                .collect(Collectors.groupingBy(p -> p.getBooking().getService().getServiceName()));

        List<RevenueReportDTO.RevenueByServiceDTO> breakdownByService = byService.entrySet().stream()
                .map(e -> RevenueReportDTO.RevenueByServiceDTO.builder()
                        .serviceName(e.getKey())
                        .bookingCount((long) e.getValue().size())
                        .revenue(e.getValue().stream().map(Payment::getNetAmount).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .collect(Collectors.toList());

        return RevenueReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .grossTotal(grossTotal)
                .discountTotal(discountTotal)
                .netRevenue(netRevenue)
                .refundedTotal(refundedTotal)
                .totalCompletedBookings((long) payments.size())
                .breakdownByPaymentMethod(breakdownByMethod)
                .breakdownByService(breakdownByService)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public TherapistCommissionReportDTO getTherapistCommissionReport(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new ValidationException("Start date and end date must not be null");
        }
        if (startDate.isAfter(endDate)) {
            throw new ValidationException("Start date must be before or equal to end date");
        }

        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        List<Payment> payments = paymentRepository.findCompletedPaymentsBetween(startDateTime, endDateTime);

        // Group completed bookings with payments by therapist
        Map<Long, List<Payment>> paymentsByTherapist = payments.stream()
                .filter(p -> p.getBooking() != null && p.getBooking().getTherapist() != null)
                .collect(Collectors.groupingBy(p -> p.getBooking().getTherapist().getId()));

        List<Therapist> allTherapists = therapistRepository.findAll();
        List<TherapistCommissionReportDTO.TherapistCommissionItemDTO> summaries = new ArrayList<>();
        BigDecimal grandTotalCommission = BigDecimal.ZERO;
        long totalMassages = 0;

        for (Therapist t : allTherapists) {
            List<Payment> tPayments = paymentsByTherapist.getOrDefault(t.getId(), List.of());
            long count = tPayments.size();
            totalMassages += count;

            int durationMinutes = tPayments.stream()
                    .filter(p -> p.getBooking().getDurationOption() != null)
                    .mapToInt(p -> p.getBooking().getDurationOption().getDurationMinutes())
                    .sum();

            BigDecimal serviceRevenue = tPayments.stream()
                    .map(Payment::getNetAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal commissionRate = t.getCommissionRate() != null ? t.getCommissionRate() : new BigDecimal("0.40");
            BigDecimal commissionEarned = serviceRevenue.multiply(commissionRate).setScale(2, RoundingMode.HALF_UP);
            grandTotalCommission = grandTotalCommission.add(commissionEarned);

            summaries.add(TherapistCommissionReportDTO.TherapistCommissionItemDTO.builder()
                    .therapistId(t.getId())
                    .therapistName(t.getFullName())
                    .nickname(t.getNickname())
                    .commissionRate(commissionRate)
                    .completedServicesCount(count)
                    .totalDurationMinutes(durationMinutes)
                    .totalServiceRevenue(serviceRevenue)
                    .commissionEarned(commissionEarned)
                    .build());
        }

        return TherapistCommissionReportDTO.builder()
                .startDate(startDate)
                .endDate(endDate)
                .totalCommissionsPaid(grandTotalCommission)
                .totalMassagesPerformed(totalMassages)
                .therapistSummaries(summaries)
                .build();
    }
}
