package com.buddi.api.spending.notification.repository;

import com.buddi.api.spending.notification.entity.SpendingCommentOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SpendingCommentOutboxRepository extends JpaRepository<SpendingCommentOutbox, Long> {

    @Query(value = "SELECT * FROM spending_comment_outbox WHERE status = 'PENDING' AND created_at < :eligibleAt ORDER BY id LIMIT :limit FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<SpendingCommentOutbox> findPendingWithSkipLock(@Param("eligibleAt") LocalDateTime eligibleAt, @Param("limit") int limit);

    @Query("SELECT o FROM SpendingCommentOutbox o WHERE o.status = 'PROCESSING' AND o.claimedAt < :threshold")
    List<SpendingCommentOutbox> findStuckProcessing(@Param("threshold") LocalDateTime threshold);
}
