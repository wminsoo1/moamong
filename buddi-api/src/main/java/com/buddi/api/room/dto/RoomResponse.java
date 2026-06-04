package com.buddi.api.room.dto;

import com.buddi.api.room.entity.Room;

public record RoomResponse(Long id, String name, String inviteCode, Long createdBy, int unreadCount, boolean isSystem) {
    public RoomResponse(Room room) {
        this(room.getId(), room.getName(), room.getInviteCode(), room.getCreatedBy(), 0, room.isSystem());
    }
    public RoomResponse(Room room, int unreadCount) {
        this(room.getId(), room.getName(), room.getInviteCode(), room.getCreatedBy(), unreadCount, room.isSystem());
    }
}
