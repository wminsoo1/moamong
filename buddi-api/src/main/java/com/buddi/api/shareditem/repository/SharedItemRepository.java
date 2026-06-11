package com.buddi.api.shareditem.repository;

import com.buddi.api.shareditem.entity.SharedItem;
import com.buddi.api.shareditem.entity.SharedItemReaction;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SharedItemRepository extends JpaRepository<SharedItem, Long> {

    @Query("SELECT si FROM SharedItem si JOIN si.roomShares rs WHERE rs.roomId = :roomId ORDER BY si.id DESC")
    List<SharedItem> findFeedByRoomId(@Param("roomId") Long roomId, Pageable pageable);

    @Query("SELECT si FROM SharedItem si JOIN si.roomShares rs WHERE rs.roomId = :roomId AND si.id < :cursor ORDER BY si.id DESC")
    List<SharedItem> findFeedByRoomIdWithCursor(@Param("roomId") Long roomId, @Param("cursor") Long cursor, Pageable pageable);

    @Query("SELECT si FROM SharedItem si LEFT JOIN FETCH si.comments WHERE si.id = :id")
    Optional<SharedItem> findByIdWithComments(@Param("id") Long id);

    @Query("SELECT si FROM SharedItem si WHERE si.isPublic = true ORDER BY si.createdAt DESC")
    List<SharedItem> findPublicFeed();

    @Query("SELECT COUNT(si) FROM SharedItem si JOIN si.roomShares rs WHERE rs.roomId = :roomId AND rs.sharedAt > :since AND si.userId != :userId")
    long countUnreadSharedItems(@Param("roomId") Long roomId, @Param("userId") Long userId, @Param("since") LocalDateTime since);

    List<SharedItem> findAllByUserId(Long userId);

    void deleteAllByUserId(Long userId);

    List<SharedItem> findByShareGroupId(String shareGroupId);

    void deleteByShareGroupId(String shareGroupId);

    @Query("SELECT r FROM SharedItemReaction r WHERE r.userId = :userId")
    List<SharedItemReaction> findReactionsByUserId(@Param("userId") Long userId);
}
