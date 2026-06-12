package com.buddi.api.room.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "room_notification_settings",
        uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_id"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoomNotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private boolean enabled;

    static RoomNotificationSetting of(Room room, Long userId, boolean enabled) {
        RoomNotificationSetting s = new RoomNotificationSetting();
        s.room = room;
        s.userId = userId;
        s.enabled = enabled;
        return s;
    }

    void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
