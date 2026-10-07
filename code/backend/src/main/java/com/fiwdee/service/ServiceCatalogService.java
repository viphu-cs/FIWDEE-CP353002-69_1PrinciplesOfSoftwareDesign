package com.fiwdee.service;

import com.fiwdee.dto.response.ServiceResponseDTO;
import com.fiwdee.dto.request.ServiceCreateRequestDTO;
import java.util.List;

public interface ServiceCatalogService {
    List<ServiceResponseDTO> getActiveServices();
    ServiceResponseDTO getActiveService(Long id);
    List<ServiceResponseDTO> getAllServices();
    ServiceResponseDTO createService(ServiceCreateRequestDTO request);
    ServiceResponseDTO updateService(Long id, ServiceCreateRequestDTO request);
    void deleteService(Long id);
}
