package com.fiwdee.repository;

import com.fiwdee.domain.entity.Review;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Review เชื่อมกับ Booking เท่านั้น — กรองด้วย therapist/customer ผ่าน path ของ Booking
    // (findByTherapistId / findByCustomerId เดิมอ้าง property ที่ไม่มีใน Review ทำให้ Spring Data
    //  สร้าง query ไม่ได้และ backend boot ไม่ขึ้น)
    Optional<Review> findByBookingId(Long bookingId);

    List<Review> findByBookingTherapistId(Long therapistId);

    List<Review> findByBookingCustomerId(Long customerId);
}
