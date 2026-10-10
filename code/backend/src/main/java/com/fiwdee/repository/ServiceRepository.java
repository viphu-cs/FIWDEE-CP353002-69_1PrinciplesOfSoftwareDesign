package com.fiwdee.repository;

import com.fiwdee.domain.entity.Service;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByIsActiveTrue();

    java.util.Optional<Service> findByServiceCodeIgnoreCase(String serviceCode);

    boolean existsByServiceCodeIgnoreCase(String serviceCode);

    boolean existsByServiceCodeIgnoreCaseAndIdNot(String serviceCode, Long id);
}
