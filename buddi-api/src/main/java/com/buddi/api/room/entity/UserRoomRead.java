package com.buddi.api.room.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_room_reads",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "room_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserRoomRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDateTime lastReadAt;

    static UserRoomRead of(Room room, Long userId) {
        UserRoomRead r = new UserRoomRead();
        r.room = room;
        r.userId = userId;
        r.lastReadAt = LocalDateTime.now();
        return r;
    }

    void touch() {
        this.lastReadAt = LocalDateTime.now();
    }
}
