package com.buddi.api.shareditem.scheduler;

import com.buddi.api.shareditem.notification.repository.SharedItemOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class SharedItemOutboxScheduler {

    private final SharedItemOutboxRepository repository;
    private final SharedItemOutboxReserver reserver;
    private final SharedItemOutboxProcessor processor;

    @Scheduled(fixedDelay = 5000)
    public void poll() {
        reserver.reserve().forEach(id -> {
            try {
                processor.process(id);
            } catch (Exception e) {
                log.error("SharedItemOutbox 처리 실패 (outboxId: {}): {}", id, e.getMessage());
            }
        });
    }

    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void recover() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        var stuck = repository.findStuckProcessing(threshold);
        if (stuck.isEmpty()) return;
        stuck.forEach(o -> o.markPending());
        log.warn("SharedItemOutbox PROCESSING 상태 복구: {}건", stuck.size());
    }
}
