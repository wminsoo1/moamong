package com.buddi.api.room.repository;

import com.buddi.api.room.entity.RoomNotificationSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface RoomNotificationSettingRepository extends JpaRepository<RoomNotificationSetting, Long> {

    @Query("SELECT s FROM RoomNotificationSetting s WHERE s.userId = :userId AND s.room.id = :roomId")
    Optional<RoomNotificationSetting> findByUserIdAndRoomId(@Param("userId") Long userId, @Param("roomId") Long roomId);
}
