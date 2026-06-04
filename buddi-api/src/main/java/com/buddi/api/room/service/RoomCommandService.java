package com.buddi.api.room.service;

import com.buddi.api.room.dto.RoomCreateRequest;
import com.buddi.api.room.dto.RoomJoinRequest;
import com.buddi.api.room.dto.RoomResponse;
import com.buddi.api.room.entity.Room;
import com.buddi.api.room.entity.RoomMemberRole;
import com.buddi.api.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class RoomCommandService {

    private final RoomRepository roomRepository;

    @Transactional
    public RoomResponse create(Long userId, RoomCreateRequest request) {
        Room room = Room.create(userId, request.name());
        room.addMember(userId, RoomMemberRole.OWNER);
        roomRepository.save(room);
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
        return new RoomResponse(room);
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
