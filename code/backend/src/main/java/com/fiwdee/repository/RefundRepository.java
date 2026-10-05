package com.fiwdee.repository;

import com.fiwdee.domain.entity.Refund;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RefundRepository extends JpaRepository<Refund, Long> {

    Optional<Refund> findByPaymentId(Long paymentId);

    List<Refund> findByPaymentBookingId(Long bookingId);
}
