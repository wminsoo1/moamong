package com.buddi.api.user.controller;

import com.buddi.api.global.oauth2.UserPrincipal;
import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.spending.entity.SpendingType;
import com.buddi.api.user.dto.CategoryGroupResponse;
import com.buddi.api.user.dto.CategoryGroupStyleRequest;
import com.buddi.api.user.dto.CategoryRequest;
import com.buddi.api.user.dto.CategoryResponse;
import com.buddi.api.user.dto.CategoryUpdateRequest;
import com.buddi.api.user.dto.UsernameRequest;
import com.buddi.api.user.dto.UserResponse;
import com.buddi.api.user.dto.UserUpdateRequest;
import com.buddi.api.user.service.UserCommandService;
import com.buddi.api.user.service.UserQueryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserQueryService userQueryService;
    private final UserCommandService userCommandService;
    private final RoomQueryService roomQueryService;

    @GetMapping("/me/category-groups")
    public ResponseEntity<List<CategoryGroupResponse>> getCategoryGroups(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(userQueryService.getCategoryGroups(principal.getUserId()));
    }

    @PatchMapping("/me/category-groups/{groupKey}")
    public ResponseEntity<CategoryGroupResponse> updateCategoryGroup(@PathVariable String groupKey,
                                                                      @RequestBody CategoryGroupStyleRequest request,
                                                                      Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(userCommandService.updateCategoryGroup(
                principal.getUserId(), groupKey, request.color(), request.icon()));
    }

    @PatchMapping("/me/category-groups/order")
    public ResponseEntity<Void> reorderCategoryGroups(@RequestBody Map<String, List<String>> body,
                                                       Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        List<String> orderedKeys = body.get("orderedKeys");
        if (orderedKeys == null) return ResponseEntity.badRequest().build();
        userCommandService.reorderCategoryGroups(principal.getUserId(), orderedKeys);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/categories")
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @RequestParam(required = false) SpendingType type,
            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(userQueryService.getCategories(principal.getUserId(), type));
    }

    @PostMapping("/me/categories")
    public ResponseEntity<CategoryResponse> addCategory(@RequestBody CategoryRequest request,
                                                         Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(userCommandService.addCategory(
                principal.getUserId(), request.name(), request.type(), request.parentGroup()));
    }

    @PatchMapping("/me/categories/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(@PathVariable Long categoryId,
                                                            @RequestBody CategoryUpdateRequest request,
                                                            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(userCommandService.updateCategory(
                principal.getUserId(), categoryId, request.name()));
    }

    @PatchMapping("/me/categories/order")
    public ResponseEntity<Void> reorderCategories(@RequestBody Map<String, List<Long>> body,
                                                   Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        List<Long> orderedIds = body.get("orderedIds");
        if (orderedIds == null) return ResponseEntity.badRequest().build();
        userCommandService.reorderCategories(principal.getUserId(), orderedIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/me/categories/{categoryId}")
    public ResponseEntity<Void> removeCategory(@PathVariable Long categoryId,
                                                Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        userCommandService.removeCategory(principal.getUserId(), categoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(new UserResponse(userQueryService.findById(principal.getUserId())));
    }

    @GetMapping("/username/check")
    public ResponseEntity<Map<String, Boolean>> checkUsername(@RequestParam String username) {
        return ResponseEntity.ok(Map.of("available", userQueryService.isUsernameAvailable(username)));
    }

    @PostMapping("/username")
    public ResponseEntity<Void> setUsername(@RequestBody UsernameRequest request,
                                            Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        userCommandService.assignUsername(principal.getUserId(), request.getUsername());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/fcm-token")
    public ResponseEntity<Void> saveFcmToken(@RequestBody Map<String, String> body,
                                             Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        userCommandService.saveFcmToken(principal.getUserId(), body.get("token"));
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/me")
    public ResponseEntity<Void> updateMe(@RequestBody @Valid UserUpdateRequest request,
                                         Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        userCommandService.updateNickname(principal.getUserId(), request.getNickname());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/me/notifications")
    public ResponseEntity<Void> updateNotificationSetting(@RequestBody Map<String, Boolean> body,
                                                         Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        Boolean enabled = body.get("enabled");
        if (enabled == null) {
            return ResponseEntity.badRequest().build();
        }
        userCommandService.updateNotificationSetting(principal.getUserId(), enabled);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me/account-share-settings")
    public ResponseEntity<Map<String, List<String>>> getAccountShareSettings(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of("hiddenCategories", userQueryService.getHiddenCategoryGroups(principal.getUserId())));
    }

    @PutMapping("/me/account-share-settings")
    public ResponseEntity<Map<String, List<String>>> updateAccountShareSettings(@RequestBody Map<String, List<String>> body,
                                                                                  Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        List<String> groups = body.getOrDefault("hiddenCategories", List.of());
        return ResponseEntity.ok(Map.of("hiddenCategories", userCommandService.updateHiddenCategoryGroups(principal.getUserId(), groups)));
    }

    @GetMapping("/me/share-settings")
    public ResponseEntity<Map<String, List<Long>>> getShareSettings(Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        List<Long> savedIds = userQueryService.getShareRoomIds(principal.getUserId());
        List<Long> myRoomIds = roomQueryService.getRoomIds(principal.getUserId());
        List<Long> validIds = savedIds.stream().filter(myRoomIds::contains).toList();
        return ResponseEntity.ok(Map.of("roomIds", validIds));
    }

    @PutMapping("/me/share-settings")
    public ResponseEntity<Map<String, List<Long>>> updateShareSettings(@RequestBody Map<String, List<Long>> body,
                                                                        Authentication authentication) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        List<Long> roomIds = body.getOrDefault("roomIds", List.of());
        return ResponseEntity.ok(Map.of("roomIds", userCommandService.updateShareRoomIds(principal.getUserId(), roomIds)));
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> withdraw(Authentication authentication, HttpServletRequest request) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        userCommandService.withdraw(principal.getUserId());
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(Authentication authentication, HttpServletRequest request) {
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        userCommandService.clearFcmToken(principal.getUserId());
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        return ResponseEntity.ok().build();
    }
}
