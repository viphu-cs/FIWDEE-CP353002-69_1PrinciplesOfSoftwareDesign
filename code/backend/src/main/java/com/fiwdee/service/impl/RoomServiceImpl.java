package com.fiwdee.service.impl;

import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.dto.request.RoomCreateRequestDTO;
import com.fiwdee.dto.response.RoomResponseDTO;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.mapper.RoomMapper;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.service.RoomService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;

    public RoomServiceImpl(RoomRepository roomRepository, RoomMapper roomMapper) {
        this.roomRepository = roomRepository;
        this.roomMapper = roomMapper;
    }

    @Override public List<RoomResponseDTO> getRooms(boolean activeOnly) {
        return (activeOnly ? roomRepository.findByIsActiveTrue() : roomRepository.findAll()).stream().map(roomMapper::toResponse).toList();
    }

    @Override public RoomResponseDTO getRoom(Long id) { return roomMapper.toResponse(findRoom(id)); }

    @Override @Transactional public RoomResponseDTO createRoom(RoomCreateRequestDTO request) {
        ensureUnique(request.roomNumber(), null);
        Room room = new Room();
        apply(room, request);
        room.setRoomStatus(RoomStatus.AVAILABLE);
        room.setIsActive(true);
        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override @Transactional public RoomResponseDTO updateRoom(Long id, RoomCreateRequestDTO request) {
        Room room = findRoom(id);
        ensureUnique(request.roomNumber(), id);
        apply(room, request);
        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override @Transactional public RoomResponseDTO updateRoomStatus(Long id, RoomStatus status) {
        Room room = findRoom(id);
        room.setRoomStatus(status);
        return roomMapper.toResponse(roomRepository.save(room));
    }

    @Override @Transactional public void deleteRoom(Long id) {
        Room room = findRoom(id);
        room.setIsActive(false);
        roomRepository.save(room);
    }

    private Room findRoom(Long id) { return roomRepository.findById(id).orElseThrow(() -> new NotFoundException("Room", id)); }
    private void ensureUnique(String number, Long id) {
        boolean exists = id == null ? roomRepository.existsByRoomNumberIgnoreCase(number.trim())
                : roomRepository.existsByRoomNumberIgnoreCaseAndIdNot(number.trim(), id);
        if (exists) throw new ConflictException("Room number already exists: " + number);
    }
    private void apply(Room room, RoomCreateRequestDTO request) {
        room.setRoomNumber(request.roomNumber().trim());
        room.setRoomType(request.roomType());
        room.setCapacity(request.capacity());
        room.setCleaningBufferMinutes(request.cleaningBufferMinutes());
    }
}
