package com.buddi.api.shareditem.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.shareditem.dto.FeedPageResponse;
import com.buddi.api.shareditem.dto.ReactionSummary;
import com.buddi.api.shareditem.dto.SharedItemCommentResponse;
import com.buddi.api.shareditem.dto.SharedItemFeedResponse;
import com.buddi.api.shareditem.entity.SharedItemCategory;
import com.buddi.api.shareditem.service.SharedItemCommandService;
import com.buddi.api.shareditem.service.SharedItemQueryService;
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

    @GetMapping("/public")
    public ResponseEntity<List<SharedItemFeedResponse>> getPublicFeed(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(sharedItemQueryService.getPublicFeed(principal.getUserId()));
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
    public ResponseEntity<List<SharedItemCommentResponse>> getComments(@PathVariable Long sharedItemId) {
        return ResponseEntity.ok(sharedItemQueryService.getComments(sharedItemId));
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

    @PostMapping("/{sharedItemId}/view")
    public ResponseEntity<Void> recordView(@PathVariable Long sharedItemId) {
        sharedItemCommandService.recordView(sharedItemId);
        return ResponseEntity.ok().build();
    }
}
