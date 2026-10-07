package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.domain.entity.QueueItem;
import com.fiwdee.dto.request.QueueStatusUpdateRequestDTO;
import com.fiwdee.dto.response.QueueItemResponseDTO;
import com.fiwdee.mapper.QueueMapper;
import com.fiwdee.service.QueueService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Receptionist queue monitor and queue-control endpoints. */
@RestController
@RequestMapping("/api/admin/queue")
@RequiredArgsConstructor
public class QueueController {

    private final QueueService queueService;
    private final QueueMapper queueMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QueueItemResponseDTO>>> getDailyQueue(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        List<QueueItemResponseDTO> queue = queueService.getDailyQueue(date)
            .stream()
            .map(queueMapper::toResponseDTO)
            .toList();
        return ResponseEntity.ok(ApiResponse.success("Daily queue retrieved", queue));
    }

    @PostMapping("/call-next")
    public ResponseEntity<ApiResponse<QueueItemResponseDTO>> callNextQueue() {
        QueueItem queueItem = queueService.callNextQueue();
        return ResponseEntity.ok(ApiResponse.success("Next customer called", queueMapper.toResponseDTO(queueItem)));
    }

    @PatchMapping("/{queueId}/status")
    public ResponseEntity<ApiResponse<QueueItemResponseDTO>> updateQueueStatus(
        @PathVariable Long queueId,
        @Valid @RequestBody QueueStatusUpdateRequestDTO request
    ) {
        QueueItem queueItem = queueService.updateQueueStatus(queueId, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Queue status updated", queueMapper.toResponseDTO(queueItem)));
    }
}
