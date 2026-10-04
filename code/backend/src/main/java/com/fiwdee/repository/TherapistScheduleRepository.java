package com.fiwdee.repository;

import com.fiwdee.domain.entity.TherapistSchedule;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TherapistScheduleRepository extends JpaRepository<TherapistSchedule, Long> {

    List<TherapistSchedule> findByTherapistId(Long therapistId);

    Optional<TherapistSchedule> findByTherapistIdAndScheduleDate(Long therapistId, LocalDate scheduleDate);

    List<TherapistSchedule> findByScheduleDate(LocalDate scheduleDate);
}
