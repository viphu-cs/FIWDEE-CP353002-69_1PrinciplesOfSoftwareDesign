package com.fiwdee.repository;

import com.fiwdee.domain.entity.Review;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

/** Repository access for immutable customer feedback records. */
public interface ReviewRepository extends JpaRepository<Review, Long> {

    boolean existsByBookingId(Long bookingId);

    List<Review> findAllByBookingTherapistId(Long therapistId);
}
