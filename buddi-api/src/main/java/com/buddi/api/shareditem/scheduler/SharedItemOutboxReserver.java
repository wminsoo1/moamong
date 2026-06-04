package com.buddi.api.shareditem.scheduler;

import com.buddi.api.shareditem.notification.repository.SharedItemOutboxRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SharedItemOutboxReserver {

    private static final int BATCH_SIZE = 100;

    private final SharedItemOutboxRepository repository;

    @Transactional
    public List<Long> reserve() {
        var records = repository.findPendingWithSkipLock(BATCH_SIZE);
        records.forEach(r -> r.markProcessing());
        return records.stream().map(r -> r.getId()).toList();
    }
}
