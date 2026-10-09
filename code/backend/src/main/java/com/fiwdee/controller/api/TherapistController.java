package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.response.PublicTherapistResponseDTO;
import com.fiwdee.service.TherapistService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Therapists Catalog", description = "รายชื่อหมอนวดและทักษะความเชี่ยวชาญ (Public)")
@RestController
@RequestMapping("/api/therapists")
public class TherapistController {
    private final TherapistService therapistService;

    public TherapistController(TherapistService therapistService) { this.therapistService = therapistService; }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PublicTherapistResponseDTO>>> getTherapists() {
        return ResponseEntity.ok(ApiResponse.success("Therapists retrieved successfully", therapistService.getActiveTherapists()));
    }
}
