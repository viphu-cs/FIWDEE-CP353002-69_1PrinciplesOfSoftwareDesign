package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.dto.response.QueueItemResponseDTO;
import com.fiwdee.mapper.QueueMapper;
import com.fiwdee.service.TherapistExecutionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Therapist-facing schedule and service execution endpoints. */
@Tag(name = "Therapist Self-Service", description = "ระบบสำหรับหมอนวด (ตรวจสอบตารางงานตนเอง, เริ่ม/เสร็จสิ้นการบริการ)")
@RestController
@RequestMapping("/api/therapist")
@RequiredArgsConstructor
public class TherapistSelfController {

    private final TherapistExecutionService therapistExecutionService;
    private final QueueMapper queueMapper;

    /**
     * The temporary therapistId parameter supports the current permit-all development security.
     * JWT integration will resolve this value from the authenticated therapist principal.
     */
    @GetMapping("/me/schedule")
    public ResponseEntity<ApiResponse<List<QueueItemResponseDTO>>> getMySchedule(@RequestParam Long therapistId) {
        List<QueueItemResponseDTO> schedule = therapistExecutionService.getMySchedule(therapistId)
            .stream()
            .map(queueMapper::toResponseDTO)
            .toList();
        return ResponseEntity.ok(ApiResponse.success("Therapist schedule retrieved", schedule));
    }

    @PostMapping("/queue/{queueId}/start")
    public ResponseEntity<ApiResponse<QueueItemResponseDTO>> startService(
        @PathVariable Long queueId,
        @RequestParam Long therapistId
    ) {
        QueueItem queueItem = therapistExecutionService.startService(queueId, therapistId);
        return ResponseEntity.ok(ApiResponse.success("Service started", queueMapper.toResponseDTO(queueItem)));
    }

    @PostMapping("/queue/{queueId}/complete")
    public ResponseEntity<ApiResponse<QueueItemResponseDTO>> completeService(
        @PathVariable Long queueId,
        @RequestParam Long therapistId
    ) {
        QueueItem queueItem = therapistExecutionService.completeService(queueId, therapistId);
        return ResponseEntity.ok(ApiResponse.success("Service completed", queueMapper.toResponseDTO(queueItem)));
    }
}
