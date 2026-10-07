package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Service;
import com.fiwdee.dto.response.ServiceResponseDTO;
import com.fiwdee.dto.request.ServiceCreateRequestDTO;
import com.fiwdee.domain.entity.ServiceDurationOption;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.ValidationException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.mapper.ServiceMapper;
import com.fiwdee.repository.ServiceRepository;
import com.fiwdee.service.ServiceCatalogService;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
@Transactional(readOnly = true)
public class ServiceCatalogServiceImpl implements ServiceCatalogService {

    private final ServiceRepository serviceRepository;
    private final ServiceMapper serviceMapper;

    public ServiceCatalogServiceImpl(ServiceRepository serviceRepository, ServiceMapper serviceMapper) {
        this.serviceRepository = serviceRepository;
        this.serviceMapper = serviceMapper;
    }

    @Override
    public List<ServiceResponseDTO> getActiveServices() {
        return serviceRepository.findByIsActiveTrue().stream().map(serviceMapper::toResponse).toList();
    }

    @Override
    public ServiceResponseDTO getActiveService(Long id) {
        Service service = serviceRepository.findById(id)
                .filter(item -> Boolean.TRUE.equals(item.getIsActive()))
                .orElseThrow(() -> new NotFoundException("Service", id));
        return serviceMapper.toResponse(service);
    }

    @Override
    public List<ServiceResponseDTO> getAllServices() {
        return serviceRepository.findAll().stream().map(serviceMapper::toResponse).toList();
    }

    @Override
    @Transactional
    public ServiceResponseDTO createService(ServiceCreateRequestDTO request) {
        if (serviceRepository.existsByServiceCodeIgnoreCase(request.serviceCode().trim())) {
            throw new ConflictException("Service code already exists: " + request.serviceCode());
        }
        Service service = new Service();
        applyServiceRequest(service, request);
        service.setIsActive(true);
        return serviceMapper.toResponse(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public ServiceResponseDTO updateService(Long id, ServiceCreateRequestDTO request) {
        Service service = serviceRepository.findById(id).orElseThrow(() -> new NotFoundException("Service", id));
        if (serviceRepository.existsByServiceCodeIgnoreCaseAndIdNot(request.serviceCode().trim(), id)) {
            throw new ConflictException("Service code already exists: " + request.serviceCode());
        }
        applyServiceRequest(service, request);
        return serviceMapper.toResponse(serviceRepository.save(service));
    }

    @Override
    @Transactional
    public void deleteService(Long id) {
        Service service = serviceRepository.findById(id).orElseThrow(() -> new NotFoundException("Service", id));
        service.setIsActive(false);
        serviceRepository.save(service);
    }

    private void applyServiceRequest(Service service, ServiceCreateRequestDTO request) {
        if (request.durationOptions() == null || request.durationOptions().isEmpty()) {
            throw new ValidationException("At least one duration option is required");
        }
        service.setServiceCode(request.serviceCode().trim());
        service.setServiceName(request.serviceName().trim());
        service.setDescription(request.description());
        service.setCategory(request.category().trim());
        service.setRequiredRoomType(request.requiredRoomType());
        service.getDurationOptions().clear();
        for (ServiceCreateRequestDTO.DurationRequest option : request.durationOptions()) {
            if (option.durationMinutes() == null || option.durationMinutes() <= 0
                    || option.price() == null || option.price().signum() < 0) {
                throw new ValidationException("Duration must be positive and price must not be negative");
            }
            ServiceDurationOption duration = new ServiceDurationOption();
            duration.setService(service);
            duration.setDurationMinutes(option.durationMinutes());
            duration.setPrice(option.price());
            duration.setIsActive(true);
            service.getDurationOptions().add(duration);
        }
    }
}
