package com.buddi.api.spending.notification.scheduler;

import com.buddi.api.spending.notification.repository.SpendingCommentOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SpendingCommentOutboxReserver {

    private static final int BATCH_SIZE = 100;

    private final SpendingCommentOutboxRepository repository;

    @Transactional
    public List<Long> reserve() {
        LocalDateTime eligibleAt = LocalDateTime.now().minusSeconds(60);
        var records = repository.findPendingWithSkipLock(eligibleAt, BATCH_SIZE);
        records.forEach(r -> r.markProcessing());
        return records.stream().map(r -> r.getId()).toList();
    }
}
