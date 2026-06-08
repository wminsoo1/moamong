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

    @Query("SELECT COUNT(r) > 0 FROM Room r JOIN r.members m1 JOIN r.members m2 WHERE m1.userId = :userId1 AND m2.userId = :userId2")
    boolean existsSharedRoom(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
