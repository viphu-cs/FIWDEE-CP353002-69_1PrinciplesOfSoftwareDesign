package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.response.ServiceResponseDTO;
import com.fiwdee.service.ServiceCatalogService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/services")
public class ServiceCatalogController {

    private final ServiceCatalogService serviceCatalogService;

    public ServiceCatalogController(ServiceCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ServiceResponseDTO>>> getServices() {
        return ResponseEntity.ok(ApiResponse.success("Services retrieved successfully", serviceCatalogService.getActiveServices()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ServiceResponseDTO>> getService(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Service retrieved successfully", serviceCatalogService.getActiveService(id)));
    }
}
