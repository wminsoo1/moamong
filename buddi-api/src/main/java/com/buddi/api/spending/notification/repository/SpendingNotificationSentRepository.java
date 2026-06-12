package com.buddi.api.spending.notification.repository;

import com.buddi.api.spending.notification.entity.SpendingNotificationSent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SpendingNotificationSentRepository extends JpaRepository<SpendingNotificationSent, Long> {

    boolean existsByOutboxIdAndReceiverId(Long outboxId, Long receiverId);

    @Query(value = "SELECT * FROM spending_notification_sent WHERE status = 'PENDING' LIMIT 100 FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<SpendingNotificationSent> findPendingWithSkipLock();

    @Query("SELECT s FROM SpendingNotificationSent s WHERE s.status = 'PROCESSING' AND s.claimedAt < :threshold")
    List<SpendingNotificationSent> findStuckProcessing(@Param("threshold") LocalDateTime threshold);
}
