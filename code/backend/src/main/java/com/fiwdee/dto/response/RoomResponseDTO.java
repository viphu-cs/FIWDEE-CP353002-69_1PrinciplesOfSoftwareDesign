package com.fiwdee.dto.response;

import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.domain.enums.RoomType;

public record RoomResponseDTO(Long id, String roomNumber, RoomType roomType, Integer capacity,
                              RoomStatus roomStatus, Integer cleaningBufferMinutes, Boolean isActive) {}
