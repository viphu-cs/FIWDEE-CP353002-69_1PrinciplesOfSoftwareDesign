package com.fiwdee.repository;

import com.fiwdee.domain.entity.TherapistSkill;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TherapistSkillRepository extends JpaRepository<TherapistSkill, Long> {

    List<TherapistSkill> findByTherapistId(Long therapistId);

    List<TherapistSkill> findByServiceId(Long serviceId);
}
