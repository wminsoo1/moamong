package com.buddi.api.shareditem.notification.repository;

import com.buddi.api.shareditem.notification.entity.NotificationSent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationSentRepository extends JpaRepository<NotificationSent, Long> {

    boolean existsByOutboxIdAndReceiverId(Long outboxId, Long receiverId);

    @Query(value = "SELECT * FROM notification_sent WHERE status = 'PENDING' LIMIT 100 FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<NotificationSent> findPendingWithSkipLock();

    @Query("SELECT s FROM NotificationSent s WHERE s.status = 'PROCESSING' AND s.claimedAt < :threshold")
    List<NotificationSent> findStuckProcessing(@Param("threshold") LocalDateTime threshold);

}
