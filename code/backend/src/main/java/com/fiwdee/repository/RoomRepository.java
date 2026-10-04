package com.fiwdee.repository;

import com.fiwdee.domain.entity.Room;
import com.fiwdee.domain.enums.RoomStatus;
import com.fiwdee.domain.enums.RoomType;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByIsActiveTrue();

    List<Room> findByRoomTypeAndIsActiveTrue(RoomType roomType);

    List<Room> findByRoomStatus(RoomStatus roomStatus);
}
