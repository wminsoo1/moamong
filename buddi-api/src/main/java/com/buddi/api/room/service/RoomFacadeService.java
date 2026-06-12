package com.buddi.api.room.service;

import com.buddi.api.room.dto.RoomResponse;
import com.buddi.api.shareditem.service.SharedItemQueryService;
import com.buddi.api.spending.service.SpendingQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomFacadeService {

    private final RoomQueryService roomQueryService;
    private final SharedItemQueryService sharedItemQueryService;
    private final SpendingQueryService spendingQueryService;
    private final RoomNotificationService roomNotificationService;

    @Transactional(readOnly = true)
    public List<RoomResponse> getMyRooms(Long userId) {
        return roomQueryService.getRoomsForUser(userId).stream()
                .map(entry -> {
                    int unread = (int) sharedItemQueryService.countUnread(entry.roomId(), userId, entry.lastReadAt());
                    int unreadSpendings = (int) spendingQueryService.countUnreadSpendings(entry.memberIds(), entry.lastReadAt());
                    var latest = spendingQueryService.findLatestSpending(entry.memberIds());
                    OffsetDateTime lastSpendingAt = latest.map(s -> s.getCreatedAt().atOffset(ZoneOffset.UTC)).orElse(null);
                    String lastSpendingPreview = latest.map(s -> {
                        String text = s.getMemo() != null ? s.getMemo() : s.getCategoryName();
                        return String.format("%s  -%,d원", text, s.getAmount());
                    }).orElse(null);
                    boolean notificationEnabled = roomNotificationService.isEnabled(userId, entry.roomId());
                    return new RoomResponse(entry.roomId(), entry.name(), entry.inviteCode(),
                            entry.createdBy(), unread, entry.isSystem(), entry.memberCount(), lastSpendingAt, unreadSpendings, lastSpendingPreview, notificationEnabled);
                })
                .toList();
    }
}
