package com.fiwdee.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.domain.enums.RoomType;
import com.fiwdee.dto.request.RoomCreateRequestDTO;
import com.fiwdee.exception.ConflictException;
import com.fiwdee.exception.NotFoundException;
import com.fiwdee.mapper.RoomMapper;
import com.fiwdee.repository.RoomRepository;
import com.fiwdee.testsupport.TestData;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

/** UT32 – RoomServiceImpl (Weak Robust EC) • มีห้อง R101 (id 101), R102 (id 102) */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("UT32 RoomService – EC")
class UT32_RoomServiceTest {

    @Mock RoomRepository roomRepository;
    @Mock RoomMapper roomMapper;
    @InjectMocks RoomServiceImpl roomService;

    private Room r101;
    private Room r102;

    @BeforeEach
    void world() {
        r101 = TestData.room(101, "R101", RoomType.SINGLE, true);
        r102 = TestData.room(102, "R102", RoomType.SINGLE, true);
        List<Room> rooms = List.of(r101, r102);

        when(roomRepository.findById(anyLong())).thenAnswer(i ->
                rooms.stream().filter(r -> r.getId().equals(i.getArgument(0))).findFirst());
        when(roomRepository.existsByRoomNumberIgnoreCase(anyString())).thenAnswer(i ->
                rooms.stream().anyMatch(r -> r.getRoomNumber().equalsIgnoreCase(i.getArgument(0))));
        when(roomRepository.existsByRoomNumberIgnoreCaseAndIdNot(anyString(), anyLong())).thenAnswer(i ->
                rooms.stream().anyMatch(r -> r.getRoomNumber().equalsIgnoreCase(i.getArgument(0))
                        && !r.getId().equals(i.getArgument(1))));
        when(roomRepository.save(any(Room.class))).thenAnswer(i -> i.getArgument(0));
    }

    @Test
    @DisplayName("UT32-TC001 (V1) createRoom \" R104 \" → trim, AVAILABLE, isActive true")
    void tc001() {
        roomService.createRoom(new RoomCreateRequestDTO(" R104 ", RoomType.SINGLE, 1, 15));

        ArgumentCaptor<Room> captor = ArgumentCaptor.forClass(Room.class);
        verify(roomRepository).save(captor.capture());
        Room saved = captor.getValue();
        assertThat(saved.getRoomNumber()).isEqualTo("R104");
        assertThat(saved.getRoomStatus()).isEqualTo(RoomStatus.AVAILABLE);
        assertThat(saved.getIsActive()).isTrue();
        assertThat(saved.getCleaningBufferMinutes()).isEqualTo(15);
    }

    @Test
    @DisplayName("UT32-TC002 (V2) updateRoom(101) ด้วยเลขเดิม → สำเร็จ roomType VIP")
    void tc002() {
        roomService.updateRoom(101L, new RoomCreateRequestDTO("R101", RoomType.VIP, 2, 20));
        assertThat(r101.getRoomType()).isEqualTo(RoomType.VIP);
        assertThat(r101.getCapacity()).isEqualTo(2);
        verify(roomRepository).save(r101);
    }

    @Test
    @DisplayName("UT32-TC003 (V3) deleteRoom(102) → isActive = false และ save (soft delete)")
    void tc003() {
        roomService.deleteRoom(102L);
        assertThat(r102.getIsActive()).isFalse();
        verify(roomRepository).save(r102);
        verify(roomRepository, never()).delete(any());
        verify(roomRepository, never()).deleteById(any());
    }

    @Test
    @DisplayName("UT32-TC004 (V4) getRooms(true) → findByIsActiveTrue ไม่เรียก findAll")
    void tc004() {
        when(roomRepository.findByIsActiveTrue()).thenReturn(List.of(r101, r102));
        roomService.getRooms(true);
        verify(roomRepository).findByIsActiveTrue();
        verify(roomRepository, never()).findAll();
    }

    @Test
    @DisplayName("UT32-TC005 (I1) createRoom \"r101\" (ต่างตัวพิมพ์) → ConflictException")
    void tc005() {
        ConflictException ex = assertThrows(ConflictException.class,
                () -> roomService.createRoom(new RoomCreateRequestDTO("r101", RoomType.SINGLE, 1, 15)));
        assertThat(ex.getMessage()).startsWith("Room number already exists");
        verify(roomRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT32-TC006 (I2) updateRoom(101) เป็น \"R102\" → ConflictException")
    void tc006() {
        assertThrows(ConflictException.class,
                () -> roomService.updateRoom(101L, new RoomCreateRequestDTO("R102", RoomType.SINGLE, 1, 15)));
        assertThat(r101.getRoomNumber()).isEqualTo("R101");
        verify(roomRepository, never()).save(any());
    }

    @Test
    @DisplayName("UT32-TC007 (I3) updateRoom(999) / deleteRoom(999) → NotFoundException")
    void tc007() {
        assertThrows(NotFoundException.class,
                () -> roomService.updateRoom(999L, new RoomCreateRequestDTO("R999", RoomType.SINGLE, 1, 15)));
        assertThrows(NotFoundException.class, () -> roomService.deleteRoom(999L));
    }
}
