package com.fiwdee.repository;

import com.fiwdee.domain.entity.ServiceDurationOption;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceDurationOptionRepository extends JpaRepository<ServiceDurationOption, Long> {

    List<ServiceDurationOption> findByServiceIdAndIsActiveTrue(Long serviceId);
}
