package com.fiwdee.repository;

import com.fiwdee.domain.entity.Therapist;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TherapistRepository extends JpaRepository<Therapist, Long> {

    List<Therapist> findByEmploymentStatus(String employmentStatus);

    Optional<Therapist> findByIdAndIsActiveTrueAndEmploymentStatusIgnoreCase(Long id, String employmentStatus);

    List<Therapist> findByIsActiveTrueAndEmploymentStatusIgnoreCase(String employmentStatus);
}
