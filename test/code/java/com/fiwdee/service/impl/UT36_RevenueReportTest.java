package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Refund;
import com.fiwdee.domain.enums.RefundStatus;
import com.fiwdee.dto.response.RevenueReportDTO;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.repository.BookingRepository;
import com.fiwdee.repository.PaymentRepository;
import com.fiwdee.repository.RefundRepository;
import com.fiwdee.repository.TherapistRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/**
 * UT36 – ReportServiceImpl.getRevenueReport (Robustness BVA ขอบด้านเดียว)
 * ขอบ 1: end − start (วัน) • ขอบ 2–3: refundedAt เทียบ [start 00:00, end 23:59:59.999999999]
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT36 getRevenueReport – date range BVA")
class UT36_RevenueReportTest {

    private static final LocalDate NOV_1 = LocalDate.of(2026, 11, 1);
    private static final LocalDate NOV_30 = LocalDate.of(2026, 11, 30);

    @Mock PaymentRepository paymentRepository;
    @Mock BookingRepository bookingRepository;
    @Mock RefundRepository refundRepository;
    @Mock TherapistRepository therapistRepository;
    @InjectMocks ReportServiceImpl reportService;

    @BeforeEach
    void world() {
        when(paymentRepository.findCompletedPaymentsBetween(any(), any())).thenReturn(List.of());
        when(refundRepository.findAll()).thenReturn(List.of());
    }

    private static Refund refundAt(LocalDateTime at) {
        Refund r = new Refund();
        r.setId(1L);
        r.setRefundAmount(new BigDecimal("100.00"));
        r.setStatus(RefundStatus.COMPLETED);
        r.setRefundedAt(at);
        return r;
    }

    @ParameterizedTest(name = "{0} start={1} end={2} → ok={3}")
    @CsvSource({
        "UT36-TC001, 2026-11-02, 2026-11-01, false",
        "UT36-TC002, 2026-11-01, 2026-11-01, true",
        "UT36-TC003, 2026-11-01, 2026-11-02, true"
    })
    void dateOrder(String tc, LocalDate start, LocalDate end, boolean ok) {
        if (ok) {
            RevenueReportDTO r = reportService.getRevenueReport(start, end);
            assertThat(r.getStartDate()).isEqualTo(start);
            assertThat(r.getEndDate()).isEqualTo(end);
            verify(paymentRepository).findCompletedPaymentsBetween(start.atStartOfDay(), end.atTime(LocalTime.MAX));
        } else {
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> reportService.getRevenueReport(start, end), tc);
            assertThat(ex.getMessage()).isEqualTo("Start date must be before or equal to end date");
        }
    }

    @ParameterizedTest(name = "{0} refundedAt={1} → refundedTotal={2}")
    @CsvSource({
        "UT36-TC004, 2026-10-31T23:59:59.999999999, 0",
        "UT36-TC005, 2026-11-01T00:00,               100.00",
        "UT36-TC006, 2026-11-01T00:00:00.000000001, 100.00",
        "UT36-TC007, 2026-11-30T23:59:59.999999998, 100.00",
        "UT36-TC008, 2026-11-30T23:59:59.999999999, 100.00",
        "UT36-TC009, 2026-12-01T00:00,               0"
    })
    void refundBoundary(String tc, LocalDateTime refundedAt, BigDecimal expected) {
        when(refundRepository.findAll()).thenReturn(List.of(refundAt(refundedAt)));

        RevenueReportDTO r = reportService.getRevenueReport(NOV_1, NOV_30);

        assertThat(r.getRefundedTotal()).as(tc).isEqualByComparingTo(expected);
    }

    @Test
    @DisplayName("UT36-TC010 startDate = null → ValidationException")
    void tc010() {
        ValidationException ex = assertThrows(ValidationException.class,
                () -> reportService.getRevenueReport(null, NOV_30));
        assertThat(ex.getMessage()).isEqualTo("Start date and end date must not be null");
    }
}
