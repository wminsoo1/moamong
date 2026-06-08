package com.buddi.api.user.service;

import com.buddi.api.spending.entity.SpendingType;
import com.buddi.api.user.dto.CategoryGroupResponse;
import com.buddi.api.user.dto.CategoryResponse;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserQueryService {

    private final UserRepository userRepository;

    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    public List<User> findAllByIds(List<Long> userIds) {
        return userRepository.findAllById(userIds);
    }

    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    public String getFcmToken(Long userId) {
        return userRepository.findById(userId).map(User::getFcmToken).orElse(null);
    }

    public List<CategoryGroupResponse> getCategoryGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return user.getCategoryGroups().stream()
                .sorted(Comparator.comparingInt(g -> g.getSortOrder()))
                .map(CategoryGroupResponse::from)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> getCategories(Long userId, SpendingType type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return user.getCategories().stream()
                .filter(c -> type == null || c.getType() == type)
                .sorted(Comparator.comparingInt(c -> c.getSortOrder()))
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    public List<Long> getShareRoomIds(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return user.getShareRoomIds();
    }

    public List<String> getHiddenCategoryGroups(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return user.getHiddenCategoryGroups();
    }
}
