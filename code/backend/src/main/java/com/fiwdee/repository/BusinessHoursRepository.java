package com.fiwdee.repository;

import com.fiwdee.domain.entity.BusinessHours;
import com.fiwdee.domain.enums.DayOfWeek;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BusinessHoursRepository extends JpaRepository<BusinessHours, Long> {

    Optional<BusinessHours> findByDayOfWeek(DayOfWeek dayOfWeek);

    java.util.List<BusinessHours> findByShopId(Long shopId);
}
