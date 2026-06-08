package com.buddi.api.room.service;

import com.buddi.api.room.dto.RoomCreateRequest;
import com.buddi.api.room.dto.RoomJoinRequest;
import com.buddi.api.room.dto.RoomResponse;
import com.buddi.api.room.entity.Room;
import com.buddi.api.room.entity.RoomMemberRole;
import com.buddi.api.room.repository.RoomRepository;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomCommandService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @Transactional
    public RoomResponse create(Long userId, RoomCreateRequest request) {
        Room room = Room.create(userId, request.name());
        room.addMember(userId, RoomMemberRole.OWNER);
        roomRepository.save(room);
        addRoomToShareSettings(userId, room.getId());
        return new RoomResponse(room);
    }

    @Transactional
    public RoomResponse join(Long userId, RoomJoinRequest request) {
        Room room = roomRepository.findByInviteCode(request.inviteCode())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "초대 코드가 올바르지 않습니다"));
        if (room.hasMember(userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 참여 중인 방입니다");
        }
        room.addMember(userId, RoomMemberRole.MEMBER);
        addRoomToShareSettings(userId, room.getId());
        return new RoomResponse(room);
    }

    private void addRoomToShareSettings(Long userId, Long roomId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;
        List<Long> updated = new ArrayList<>(user.getShareRoomIds());
        if (!updated.contains(roomId)) {
            updated.add(roomId);
            user.updateShareRoomIds(updated);
        }
    }

    @Transactional
    public void leaveRoom(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방이 존재하지 않습니다"));
        if (!room.hasMember(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방 멤버가 아닙니다");
        }
        room.leave(userId);
    }

    @Transactional
    public void kickMember(Long roomId, Long ownerId, Long targetUserId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방이 존재하지 않습니다"));
        room.kickMember(ownerId, targetUserId);
    }

    @Transactional
    public String regenerateInviteCode(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방이 존재하지 않습니다"));
        if (!room.isOwner(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방장만 초대 코드를 재생성할 수 있습니다");
        }
        return room.regenerateInviteCode();
    }

    @Transactional
    public void renameRoom(Long roomId, Long userId, String name) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방이 존재하지 않습니다"));
        if (!room.hasMember(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방 멤버가 아닙니다");
        }
        try {
            room.rename(name);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Transactional
    public void markRead(Long roomId, Long userId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방이 존재하지 않습니다"));
        if (!room.hasMember(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방 멤버가 아닙니다");
        }
        room.markRead(userId);
    }

    @Transactional
    public void deleteRoom(Long roomId, Long ownerId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방이 존재하지 않습니다"));
        if (!room.getCreatedBy().equals(ownerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "방장만 방을 삭제할 수 있습니다");
        }
        roomRepository.delete(room);
    }
}
