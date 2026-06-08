package com.buddi.api.global.config;

import com.buddi.api.room.entity.Room;
import com.buddi.api.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SystemRoomInitializer implements CommandLineRunner {

    private final RoomRepository roomRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (roomRepository.findFirstByIsSystemTrue().isEmpty()) {
            roomRepository.save(Room.createSystem("전체 공유방"));
        }
    }
}
