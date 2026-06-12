package com.buddi.api.room.service;

import com.buddi.api.room.entity.Room;
import com.buddi.api.room.repository.RoomNotificationSettingRepository;
import com.buddi.api.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class RoomNotificationService {

    private final RoomRepository roomRepository;
    private final RoomNotificationSettingRepository settingRepository;
    private final RoomQueryService roomQueryService;

    public boolean isEnabled(Long userId, Long roomId) {
        return settingRepository.findByUserIdAndRoomId(userId, roomId)
                .map(s -> s.isEnabled())
                .orElse(true);
    }

    @Transactional
    public boolean toggle(Long userId, Long roomId) {
        roomQueryService.validateMember(roomId, userId);
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "방이 없습니다"));
        room.toggleNotification(userId);
        return room.isNotificationEnabled(userId);
    }
}
