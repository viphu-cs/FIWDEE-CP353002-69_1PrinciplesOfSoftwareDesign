package com.fiwdee.repository;

import com.fiwdee.domain.entity.Therapist;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TherapistRepository extends JpaRepository<Therapist, Long> {

    List<Therapist> findByEmploymentStatus(String employmentStatus);
}
