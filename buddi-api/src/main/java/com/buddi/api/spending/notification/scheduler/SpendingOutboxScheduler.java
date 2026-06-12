package com.buddi.api.spending.notification.scheduler;

import com.buddi.api.spending.notification.repository.SpendingOutboxRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class SpendingOutboxScheduler {

    private final SpendingOutboxRepository repository;
    private final SpendingOutboxReserver reserver;
    private final SpendingOutboxProcessor processor;

    @Scheduled(fixedDelay = 5000)
    public void poll() {
        reserver.reserve().forEach(id -> {
            try {
                processor.process(id);
            } catch (Exception e) {
                log.error("SpendingOutbox 처리 실패 (outboxId: {}): {}", id, e.getMessage());
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
        log.warn("SpendingOutbox PROCESSING 상태 복구: {}건", stuck.size());
    }
}
