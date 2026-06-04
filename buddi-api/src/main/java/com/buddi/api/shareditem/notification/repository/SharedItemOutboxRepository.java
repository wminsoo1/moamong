package com.buddi.api.shareditem.notification.repository;

import com.buddi.api.shareditem.notification.entity.OutboxStatus;
import com.buddi.api.shareditem.notification.entity.SharedItemOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SharedItemOutboxRepository extends JpaRepository<SharedItemOutbox, Long> {

    @Query(value = "SELECT * FROM shared_item_outbox " +
            "WHERE status = 'PENDING' " +
            "LIMIT :limit " +
            "FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<SharedItemOutbox> findPendingWithSkipLock(@Param("limit") int limit);

    @Query("SELECT o FROM SharedItemOutbox o WHERE o.status = 'PROCESSING' AND o.claimedAt < :threshold")
    List<SharedItemOutbox> findStuckProcessing(@Param("threshold") LocalDateTime threshold);
}
