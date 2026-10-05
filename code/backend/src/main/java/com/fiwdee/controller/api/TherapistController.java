package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.dto.response.PublicTherapistResponseDTO;
import com.fiwdee.service.TherapistService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
