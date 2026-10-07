package com.fiwdee.service;

import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.dto.request.RoomCreateRequestDTO;
import com.fiwdee.dto.response.RoomResponseDTO;
import java.util.List;

public interface RoomService {
    List<RoomResponseDTO> getRooms(boolean activeOnly);
    RoomResponseDTO getRoom(Long id);
    RoomResponseDTO createRoom(RoomCreateRequestDTO request);
    RoomResponseDTO updateRoom(Long id, RoomCreateRequestDTO request);
    RoomResponseDTO updateRoomStatus(Long id, RoomStatus status);
    void deleteRoom(Long id);
}
