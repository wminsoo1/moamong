package com.buddi.api.user.service;

import com.buddi.api.spending.entity.SpendingType;
import com.buddi.api.user.dto.CategoryGroupResponse;
import com.buddi.api.user.dto.CategoryResponse;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserCommandService {

    private final UserRepository userRepository;

    @Transactional
    public void saveFcmToken(Long userId, String token) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.updateFcmToken(token);
    }

    @Transactional
    public void clearFcmToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.clearFcmToken();
    }

    @Transactional
    public void assignUsername(Long userId, String username) {
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 username입니다");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.assignUsername(username);
    }

    @Transactional
    public void updateNickname(Long userId, String nickname) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.update(nickname);
    }

    @Transactional
    public void withdraw(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.deactivate();
    }

    @Transactional
    public CategoryResponse addCategory(Long userId, String name, SpendingType type, String parentGroup) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        try {
            return CategoryResponse.from(user.addCategory(name, type, parentGroup));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Transactional
    public CategoryResponse updateCategory(Long userId, Long categoryId, String name) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        try {
            return CategoryResponse.from(user.updateCategoryName(categoryId, name));
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage();
            HttpStatus status = msg != null && msg.contains("찾을 수 없습니다")
                    ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            throw new ResponseStatusException(status, msg);
        }
    }

    @Transactional
    public void removeCategory(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        try {
            user.removeCategory(categoryId);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, e.getMessage());
        }
    }

    @Transactional
    public void reorderCategories(Long userId, List<Long> orderedIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.reorderCategories(orderedIds);
    }

    @Transactional
    public CategoryGroupResponse updateCategoryGroup(Long userId, String groupKey, String color, String icon) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        try {
            return CategoryGroupResponse.from(user.updateCategoryGroup(groupKey, color, icon));
        } catch (IllegalArgumentException e) {
            String msg = e.getMessage();
            HttpStatus status = msg != null && msg.contains("찾을 수 없습니다")
                    ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
            throw new ResponseStatusException(status, msg);
        }
    }

    @Transactional
    public void reorderCategoryGroups(Long userId, List<String> orderedKeys) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.reorderCategoryGroups(orderedKeys);
    }

    @Transactional
    public void updateNotificationSetting(Long userId, boolean enabled) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.updateNotificationSetting(enabled);
    }
}
