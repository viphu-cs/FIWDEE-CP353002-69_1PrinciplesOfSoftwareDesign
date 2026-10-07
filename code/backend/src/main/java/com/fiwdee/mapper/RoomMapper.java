package com.fiwdee.mapper;

import com.fiwdee.domain.entity.Room;
import com.fiwdee.dto.response.RoomResponseDTO;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {
    public RoomResponseDTO toResponse(Room room) {
        return new RoomResponseDTO(room.getId(), room.getRoomNumber(), room.getRoomType(), room.getCapacity(),
                room.getRoomStatus(), room.getCleaningBufferMinutes(), room.getIsActive());
    }
}
