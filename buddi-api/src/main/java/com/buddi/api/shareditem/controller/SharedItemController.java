package com.buddi.api.shareditem.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.shareditem.dto.FeedPageResponse;
import com.buddi.api.shareditem.dto.ReactionSummary;
import com.buddi.api.shareditem.dto.SharedItemCommentResponse;
import com.buddi.api.shareditem.dto.SharedItemRequest;
import com.buddi.api.shareditem.dto.SharedItemResponse;
import com.buddi.api.shareditem.dto.SharedItemUpdateRequest;
import com.buddi.api.shareditem.entity.SharedItemCategory;
import com.buddi.api.shareditem.service.SharedItemCommandService;
import com.buddi.api.shareditem.service.SharedItemQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shared-items")
@RequiredArgsConstructor
public class SharedItemController {

    private final SharedItemQueryService sharedItemQueryService;
    private final SharedItemCommandService sharedItemCommandService;

    @PostMapping
    public ResponseEntity<List<SharedItemResponse>> create(
            @Valid @RequestBody SharedItemRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(sharedItemCommandService.create(
                principal.getUserId(),
                request.url(), request.title(), request.imageUrl(),
                request.review(), request.category(), request.amount(),
                request.roomIds(), request.isPublic()));
    }

    @GetMapping("/categories")
    public ResponseEntity<List<Map<String, String>>> getCategories() {
        List<Map<String, String>> result = java.util.Arrays.stream(SharedItemCategory.values())
                .map(c -> Map.of("key", c.name(), "name", c.getName(), "emoji", c.getEmoji(), "color", c.getColor()))
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping
    public ResponseEntity<FeedPageResponse> getFeed(
            @RequestParam Long roomId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(sharedItemQueryService.getSharedItemFeed(principal.getUserId(), roomId, cursor, size));
    }

    @PostMapping("/{sharedItemId}/reactions")
    public ResponseEntity<List<ReactionSummary>> toggleReaction(
            @PathVariable Long sharedItemId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String emoji = body.get("emoji");
        if (emoji == null || emoji.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "이모지를 입력해주세요");
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(sharedItemCommandService.toggleReaction(
                principal.getUserId(), sharedItemId, emoji));
    }

    @GetMapping("/{sharedItemId}/comments")
    public ResponseEntity<List<SharedItemCommentResponse>> getComments(
            @PathVariable Long sharedItemId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(sharedItemQueryService.getComments(sharedItemId, principal.getUserId()));
    }

    @PostMapping("/{sharedItemId}/comments")
    public ResponseEntity<SharedItemCommentResponse> addComment(
            @PathVariable Long sharedItemId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "댓글 내용을 입력해주세요");
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(sharedItemCommandService.addComment(
                principal.getUserId(), sharedItemId, content));
    }

    @PutMapping("/{sharedItemId}")
    public ResponseEntity<Void> update(
            @PathVariable Long sharedItemId,
            @Valid @RequestBody SharedItemUpdateRequest request,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        sharedItemCommandService.update(sharedItemId, principal.getUserId(),
                request.title(), request.url(), request.imageUrl(),
                request.memo(), request.category(), request.amount());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{sharedItemId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long sharedItemId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        sharedItemCommandService.delete(sharedItemId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        sharedItemCommandService.deleteComment(commentId, principal.getUserId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{sharedItemId}/view")
    public ResponseEntity<Void> recordView(@PathVariable Long sharedItemId) {
        sharedItemCommandService.recordView(sharedItemId);
        return ResponseEntity.ok().build();
    }
}
