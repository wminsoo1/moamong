package com.buddi.api.room.dto;

import com.buddi.api.room.entity.Room;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.LocalDateTime;

public record RoomResponse(Long id, String name, String inviteCode, Long createdBy, int unreadCount, boolean isSystem, int memberCount, OffsetDateTime lastSpendingAt, int unreadSpendingCount, String lastSpendingPreview, boolean notificationEnabled) {
    public RoomResponse(Room room) {
        this(room.getId(), room.getName(), room.getInviteCode(), room.getCreatedBy(), 0, room.isSystem(), room.getMembers().size(), null, 0, null, true);
    }
    public RoomResponse(Room room, int unreadCount) {
        this(room.getId(), room.getName(), room.getInviteCode(), room.getCreatedBy(), unreadCount, room.isSystem(), room.getMembers().size(), null, 0, null, true);
    }
    public RoomResponse(Room room, int unreadCount, LocalDateTime lastSpendingAt) {
        this(room.getId(), room.getName(), room.getInviteCode(), room.getCreatedBy(), unreadCount, room.isSystem(), room.getMembers().size(),
                lastSpendingAt != null ? lastSpendingAt.atOffset(ZoneOffset.UTC) : null, 0, null, true);
    }
}
