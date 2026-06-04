package com.buddi.api.room.repository;

import com.buddi.api.room.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByInviteCode(String inviteCode);
    Optional<Room> findFirstByIsSystemTrue();

    @Query("SELECT r FROM Room r JOIN r.members m WHERE m.userId = :userId")
    List<Room> findByUserId(@Param("userId") Long userId);

}
