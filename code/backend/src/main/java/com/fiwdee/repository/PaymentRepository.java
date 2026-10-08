package com.fiwdee.repository;

import com.fiwdee.domain.entity.Payment;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByBookingId(Long bookingId);

    Optional<Payment> findByPaymentReferenceCode(String paymentReferenceCode);

    @Query("SELECT p FROM Payment p WHERE p.paidAt BETWEEN :startDate AND :endDate ORDER BY p.paidAt DESC")
    List<Payment> findPaymentsBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT p FROM Payment p JOIN FETCH p.booking b "
            + "LEFT JOIN FETCH b.service s "
            + "LEFT JOIN FETCH b.therapist t "
            + "WHERE p.paymentStatus IN ('COMPLETED', 'REFUNDED') "
            + "AND p.paidAt >= :startDate AND p.paidAt <= :endDate ORDER BY p.paidAt DESC")
    List<Payment> findCompletedPaymentsBetween(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
