package com.buddi.api.room.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.room.dto.RoomCreateRequest;
import com.buddi.api.room.dto.RoomJoinRequest;
import com.buddi.api.room.dto.RoomMemberResponse;
import com.buddi.api.room.dto.RoomResponse;
import com.buddi.api.room.service.RoomCommandService;
import com.buddi.api.room.service.RoomQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomCommandService roomCommandService;
    private final RoomQueryService roomQueryService;

    @PostMapping
    public ResponseEntity<RoomResponse> create(@RequestBody RoomCreateRequest request,
                                                Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(roomCommandService.create(principal.getUserId(), request));
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> join(@RequestBody RoomJoinRequest request,
                                              Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(roomCommandService.join(principal.getUserId(), request));
    }

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getMyRooms(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(roomQueryService.getMyRooms(principal.getUserId()));
    }

    @GetMapping("/{roomId}/members")
    public ResponseEntity<List<RoomMemberResponse>> getMembers(@PathVariable Long roomId,
                                                                Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        roomQueryService.validateMember(roomId, principal.getUserId());
        return ResponseEntity.ok(roomQueryService.getMembers(roomId));
    }

    @DeleteMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(@PathVariable Long roomId, Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        roomCommandService.leaveRoom(roomId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{roomId}/members/{targetUserId}")
    public ResponseEntity<Void> kickMember(@PathVariable Long roomId, @PathVariable Long targetUserId,
                                            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        roomCommandService.kickMember(roomId, principal.getUserId(), targetUserId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{roomId}/invite-code/regenerate")
    public ResponseEntity<java.util.Map<String, String>> regenerateInviteCode(
            @PathVariable Long roomId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String newCode = roomCommandService.regenerateInviteCode(roomId, principal.getUserId());
        return ResponseEntity.ok(java.util.Map.of("inviteCode", newCode));
    }

    @PatchMapping("/{roomId}/name")
    public ResponseEntity<Void> renameRoom(@PathVariable Long roomId,
                                            @RequestBody java.util.Map<String, String> body,
                                            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        String name = body.get("name");
        if (name == null || name.isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "방 이름을 입력해주세요");
        }
        roomCommandService.renameRoom(roomId, principal.getUserId(), name);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{roomId}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long roomId, Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        roomCommandService.markRead(roomId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId, Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        roomCommandService.deleteRoom(roomId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }
}
