package com.buddi.api.spending.notification.repository;

import com.buddi.api.spending.notification.entity.SpendingOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SpendingOutboxRepository extends JpaRepository<SpendingOutbox, Long> {

    @Query(value = "SELECT * FROM spending_outbox WHERE status = 'PENDING' LIMIT :limit FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<SpendingOutbox> findPendingWithSkipLock(@Param("limit") int limit);

    @Query("SELECT o FROM SpendingOutbox o WHERE o.status = 'PROCESSING' AND o.claimedAt < :threshold")
    List<SpendingOutbox> findStuckProcessing(@Param("threshold") LocalDateTime threshold);
}
