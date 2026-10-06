package com.fiwdee.repository;

import com.fiwdee.domain.entity.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    Optional<Review> findByBookingId(Long bookingId);

    List<Review> findByBookingTherapistId(Long therapistId);

    List<Review> findByBookingCustomerId(Long customerId);
}