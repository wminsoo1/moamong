package com.buddi.api.room.service;

import com.buddi.api.room.dto.RoomMemberResponse;
import com.buddi.api.room.dto.RoomResponse;
import com.buddi.api.room.entity.Room;
import com.buddi.api.room.repository.RoomRepository;
import com.buddi.api.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomQueryService {

    private final RoomRepository roomRepository;
    private final UserQueryService userQueryService;

    public record RoomEntry(Long roomId, String name, String inviteCode, Long createdBy, boolean isSystem,
                            int memberCount, List<Long> memberIds, LocalDateTime lastReadAt) {}

    @Transactional(readOnly = true)
    public List<RoomEntry> getRoomsForUser(Long userId) {
        return roomRepository.findByUserId(userId).stream()
                .map(room -> {
                    List<Long> memberIds = room.getMembers().stream().map(m -> m.getUserId()).toList();
                    LocalDateTime lastReadAt = room.getLastReadAt(userId).orElse(LocalDateTime.of(2000, 1, 1, 0, 0, 0));
                    return new RoomEntry(room.getId(), room.getName(), room.getInviteCode(),
                            room.getCreatedBy(), room.isSystem(), memberIds.size(), memberIds, lastReadAt);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Long> getRoomIds(Long userId) {
        return roomRepository.findByUserId(userId).stream()
                .map(Room::getId)
                .toList();
    }

    @Transactional(readOnly = true)
    public boolean isSystemRoom(Long roomId) {
        return roomRepository.findById(roomId)
                .map(Room::isSystem)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public List<Long> getRoomMemberIds(Long roomId, Long excludeUserId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return room.getMembers().stream()
                .map(m -> m.getUserId())
                .filter(id -> !id.equals(excludeUserId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoomMemberResponse> getMembers(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        List<Long> userIds = room.getMembers().stream().map(m -> m.getUserId()).toList();
        return userQueryService.findAllByIds(userIds).stream()
                .map(u -> new RoomMemberResponse(u.getId(), u.getUsername()))
                .toList();
    }

    @Transactional(readOnly = true)
    public void validateMember(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방이 존재하지 않습니다"));
        if (!room.hasMember(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방 멤버가 아닙니다");
        }
    }

    @Transactional(readOnly = true)
    public boolean isMember(Long roomId, Long userId) {
        return roomRepository.findById(roomId)
                .map(room -> room.hasMember(userId))
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public boolean existsSharedRoom(Long userId1, Long userId2) {
        return roomRepository.existsSharedRoom(userId1, userId2);
    }

    @Transactional(readOnly = true)
    public String getRoomName(Long roomId) {
        return roomRepository.findById(roomId).map(Room::getName).orElse(null);
    }

    @Transactional(readOnly = true)
    public Long getFirstSharedNonSystemRoomId(Long userId1, Long userId2) {
        return roomRepository.findByUserId(userId1).stream()
                .filter(r -> !r.isSystem())
                .filter(r -> r.hasMember(userId2))
                .map(Room::getId)
                .findFirst()
                .orElse(null);
    }
}
