package com.buddi.api.user.service;

import com.buddi.api.card.entity.Card;
import com.buddi.api.card.repository.CardRepository;
import com.buddi.api.room.entity.Room;
import com.buddi.api.room.repository.RoomRepository;
import com.buddi.api.shareditem.repository.SharedItemRepository;
import com.buddi.api.spending.entity.SpendingType;
import com.buddi.api.spending.repository.RecurringSpendingRepository;
import com.buddi.api.spending.repository.SpendingRepository;
import com.buddi.api.spending.service.SpendingCacheService;
import com.buddi.api.user.dto.CategoryGroupResponse;
import com.buddi.api.user.dto.CategoryResponse;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserCommandService {

    private final UserRepository userRepository;
    private final CardRepository cardRepository;
    private final SpendingRepository spendingRepository;
    private final RecurringSpendingRepository recurringSpendingRepository;
    private final SharedItemRepository sharedItemRepository;
    private final RoomRepository roomRepository;
    private final SpendingCacheService spendingCacheService;

    @Transactional
    public void addCard(Long userId, Long cardId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "카드를 찾을 수 없습니다"));
        try {
            user.addCard(card);
        } catch (IllegalStateException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, e.getMessage());
        }
    }

    @Transactional
    public void removeCard(Long userId, Long cardId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.removeCard(cardId);
    }

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
    public void updateUsername(Long userId, String username) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (username.equals(user.getUsername())) return;
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 사용 중인 username입니다");
        }
        try {
            user.assignUsername(username);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
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

        // 지출 / 정기지출 삭제
        spendingRepository.deleteAllByUserId(userId);
        recurringSpendingRepository.deleteAllByUserId(userId);

        // 공유 핫템 삭제
        sharedItemRepository.deleteAllByUserId(userId);

        // 방 처리: 방장이면 방 삭제, 멤버면 탈퇴
        List<Room> rooms = roomRepository.findByUserId(userId);
        for (Room room : rooms) {
            if (room.isSystem()) continue;
            if (room.getCreatedBy().equals(userId)) {
                roomRepository.delete(room);
            } else {
                room.removeMember(userId);
            }
        }

        // 개인정보 익명화 (재가입 가능하도록 providerId는 삭제 표시)
        user.anonymize();
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

    @Transactional
    public List<Long> updateShareRoomIds(Long userId, List<Long> roomIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.updateShareRoomIds(roomIds);
        return user.getShareRoomIds();
    }

    @Transactional
    public List<String> updateHiddenCategoryGroups(Long userId, List<String> groups) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        user.updateHiddenCategoryGroups(groups);
        YearMonth now = YearMonth.now();
        user.getShareRoomIds().forEach(roomId -> {
            spendingCacheService.evictMonthly(roomId, now.getYear(), now.getMonthValue());
            spendingCacheService.evictMonthly(roomId, now.minusMonths(1).getYear(), now.minusMonths(1).getMonthValue());
        });
        return user.getHiddenCategoryGroups();
    }
}
