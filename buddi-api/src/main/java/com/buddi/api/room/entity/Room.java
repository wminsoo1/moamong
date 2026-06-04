package com.buddi.api.room.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String inviteCode;

    @Column(nullable = false)
    private Long createdBy;

    @Column(nullable = false)
    private boolean isSystem = false;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("joinedAt ASC")
    private List<RoomMember> members = new ArrayList<>();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserRoomRead> readStates = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public static Room create(Long creatorId, String name) {
        Room room = new Room();
        room.name = name;
        room.createdBy = creatorId;
        room.inviteCode = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return room;
    }

    public static Room createSystem(String name) {
        Room room = new Room();
        room.name = name;
        room.createdBy = 0L;
        room.isSystem = true;
        room.inviteCode = UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
        return room;
    }

    public void addMember(Long userId, RoomMemberRole role) {
        members.add(RoomMember.of(this, userId, role));
    }

    public boolean hasMember(Long userId) {
        return members.stream().anyMatch(m -> m.getUserId().equals(userId));
    }

    public boolean isOwner(Long userId) {
        if (createdBy != null && createdBy.equals(userId)) {
            return true;
        }
        return members.stream()
                .anyMatch(m -> m.getUserId().equals(userId) && m.getRole() == RoomMemberRole.OWNER);
    }

    public void removeMember(Long userId) {
        members.removeIf(m -> m.getUserId().equals(userId));
    }

    public void leave(Long userId) {
        if (isOwner(userId)) {
            throw new IllegalStateException("방장은 방을 나갈 수 없습니다");
        }
        removeMember(userId);
    }

    public void kickMember(Long ownerId, Long targetUserId) {
        if (!isOwner(ownerId)) {
            throw new IllegalStateException("방장만 멤버를 내보낼 수 있습니다");
        }
        if (ownerId.equals(targetUserId)) {
            throw new IllegalStateException("본인은 내보낼 수 없습니다");
        }
        if (!hasMember(targetUserId)) {
            throw new IllegalStateException("해당 멤버가 없습니다");
        }
        removeMember(targetUserId);
    }

    public void markRead(Long userId) {
        readStates.stream()
                .filter(r -> r.getUserId().equals(userId))
                .findFirst()
                .ifPresentOrElse(
                        UserRoomRead::touch,
                        () -> readStates.add(UserRoomRead.of(this, userId))
                );
    }

    public Optional<LocalDateTime> getLastReadAt(Long userId) {
        return readStates.stream()
                .filter(r -> r.getUserId().equals(userId))
                .map(UserRoomRead::getLastReadAt)
                .findFirst();
    }

}
