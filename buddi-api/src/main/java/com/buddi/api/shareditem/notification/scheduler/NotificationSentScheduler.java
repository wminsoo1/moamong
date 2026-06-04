package com.buddi.api.shareditem.notification.scheduler;

import com.buddi.api.shareditem.notification.repository.NotificationSentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationSentScheduler {

    private final NotificationSentRepository repository;
    private final NotificationSentReserver reserver;
    private final NotificationSentProcessor processor;

    @Scheduled(fixedDelay = 5000)
    public void poll() {
        reserver.reserve().forEach(id -> {
            try {
                processor.process(id);
            } catch (Exception e) {
                log.error("알림 전송 실패 (sentId: {}): {}", id, e.getMessage());
            }
        });
    }

    @Scheduled(fixedDelay = 300_000)
    @Transactional
    public void recover() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(5);
        var stuck = repository.findStuckProcessing(threshold);
        if (stuck.isEmpty()) return;
        stuck.forEach(s -> s.markPending());
        log.warn("알림 PROCESSING 상태 복구: {}건", stuck.size());
    }
}
