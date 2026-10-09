package com.fiwdee.controller.api;

import com.fiwdee.common.ApiResponse;
import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.dto.request.RoomCreateRequestDTO;
import com.fiwdee.dto.request.RoomStatusRequestDTO;
import com.fiwdee.dto.request.ServiceCreateRequestDTO;
import com.fiwdee.dto.request.ShopUpdateRequestDTO;
import com.fiwdee.dto.request.TherapistCreateRequestDTO;
import com.fiwdee.dto.request.TherapistScheduleUpdateRequestDTO;
import com.fiwdee.dto.response.RoomResponseDTO;
import com.fiwdee.dto.response.ServiceResponseDTO;
import com.fiwdee.dto.response.ShopResponseDTO;
import com.fiwdee.dto.response.TherapistResponseDTO;
import com.fiwdee.dto.response.TherapistScheduleResponseDTO;
import com.fiwdee.service.RoomService;
import com.fiwdee.service.ServiceCatalogService;
import com.fiwdee.service.ShopService;
import com.fiwdee.service.TherapistService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * TODO: Apply OWNER/RECEPTIONIST authorization after shared method security is enabled by Dev 1.
 * OWNER may use all endpoints; RECEPTIONIST may read and change room status only.
 */
@Tag(name = "Admin Resources", description = "จัดการข้อมูลหลัก (CRUD ห้องนวด, บริการ, ตารางงานหมอนวด)")
@RestController
@RequestMapping("/api/admin")
public class AdminResourceController {
    private final ServiceCatalogService serviceCatalog;
    private final RoomService roomService;
    private final TherapistService therapistService;
    private final ShopService shopService;

    public AdminResourceController(ServiceCatalogService serviceCatalog, RoomService roomService,
                                   TherapistService therapistService, ShopService shopService) {
        this.serviceCatalog = serviceCatalog;
        this.roomService = roomService;
        this.therapistService = therapistService;
        this.shopService = shopService;
    }

    @GetMapping("/services")
    public ResponseEntity<ApiResponse<List<ServiceResponseDTO>>> getServices() {
        return ok("Services retrieved successfully", serviceCatalog.getAllServices());
    }
    @GetMapping("/services/{id}")
    public ResponseEntity<ApiResponse<ServiceResponseDTO>> getService(@PathVariable Long id) {
        return ok("Service retrieved successfully", serviceCatalog.getActiveService(id));
    }
    @PostMapping("/services")
    public ResponseEntity<ApiResponse<ServiceResponseDTO>> createService(@Valid @RequestBody ServiceCreateRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success("Service created successfully", serviceCatalog.createService(request)));
    }
    @PutMapping("/services/{id}")
    public ResponseEntity<ApiResponse<ServiceResponseDTO>> updateService(@PathVariable Long id, @Valid @RequestBody ServiceCreateRequestDTO request) {
        return ok("Service updated successfully", serviceCatalog.updateService(id, request));
    }
    @DeleteMapping("/services/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        serviceCatalog.deleteService(id);
        return ok("Service deactivated successfully", null);
    }

    @GetMapping("/rooms")
    public ResponseEntity<ApiResponse<List<RoomResponseDTO>>> getRooms(@RequestParam(defaultValue = "false") boolean activeOnly) {
        return ok("Rooms retrieved successfully", roomService.getRooms(activeOnly));
    }
    @GetMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> getRoom(@PathVariable Long id) {
        return ok("Room retrieved successfully", roomService.getRoom(id));
    }
    @PostMapping("/rooms")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> createRoom(@Valid @RequestBody RoomCreateRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success("Room created successfully", roomService.createRoom(request)));
    }
    @PutMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> updateRoom(@PathVariable Long id, @Valid @RequestBody RoomCreateRequestDTO request) {
        return ok("Room updated successfully", roomService.updateRoom(id, request));
    }
    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        return ok("Room deactivated successfully", null);
    }
    @PatchMapping("/rooms/{id}/status")
    public ResponseEntity<ApiResponse<RoomResponseDTO>> updateRoomStatus(@PathVariable Long id, @Valid @RequestBody RoomStatusRequestDTO request) {
        RoomStatus status = request.roomStatus();
        return ok("Room status updated successfully", roomService.updateRoomStatus(id, status));
    }

    @GetMapping("/therapists")
    public ResponseEntity<ApiResponse<List<TherapistResponseDTO>>> getTherapists(@RequestParam(defaultValue = "false") boolean activeOnly) {
        return ok("Therapists retrieved successfully", therapistService.getTherapists(activeOnly));
    }
    @GetMapping("/therapists/{id}")
    public ResponseEntity<ApiResponse<TherapistResponseDTO>> getTherapist(@PathVariable Long id) {
        return ok("Therapist retrieved successfully", therapistService.getTherapist(id));
    }
    @PostMapping("/therapists")
    public ResponseEntity<ApiResponse<TherapistResponseDTO>> createTherapist(@Valid @RequestBody TherapistCreateRequestDTO request) {
        return ResponseEntity.status(201).body(ApiResponse.success("Therapist created successfully", therapistService.createTherapist(request)));
    }
    @PutMapping("/therapists/{id}")
    public ResponseEntity<ApiResponse<TherapistResponseDTO>> updateTherapist(@PathVariable Long id, @Valid @RequestBody TherapistCreateRequestDTO request) {
        return ok("Therapist updated successfully", therapistService.updateTherapist(id, request));
    }
    @DeleteMapping("/therapists/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTherapist(@PathVariable Long id) {
        therapistService.deleteTherapist(id);
        return ok("Therapist deactivated successfully", null);
    }
    @GetMapping("/therapists/{id}/schedules")
    public ResponseEntity<ApiResponse<List<TherapistScheduleResponseDTO>>> getSchedules(@PathVariable Long id) {
        return ok("Therapist schedules retrieved successfully", therapistService.getSchedules(id));
    }
    @PutMapping("/therapists/{id}/schedules")
    public ResponseEntity<ApiResponse<TherapistScheduleResponseDTO>> updateSchedule(@PathVariable Long id, @Valid @RequestBody TherapistScheduleUpdateRequestDTO request) {
        return ok("Therapist schedule saved successfully", therapistService.updateSchedule(id, request));
    }

    @GetMapping("/shop")
    public ResponseEntity<ApiResponse<ShopResponseDTO>> getShop() { return ok("Shop retrieved successfully", shopService.getShop()); }
    @PutMapping("/shop")
    public ResponseEntity<ApiResponse<ShopResponseDTO>> updateShop(@Valid @RequestBody ShopUpdateRequestDTO request) {
        return ok("Shop updated successfully", shopService.updateShop(request));
    }

    private static <T> ResponseEntity<ApiResponse<T>> ok(String message, T data) {
        return ResponseEntity.ok(ApiResponse.success(message, data));
    }
}
