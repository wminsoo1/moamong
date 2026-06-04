package com.buddi.api.spending.service;

import com.buddi.api.spending.dto.RecurringSpendingRequest;
import com.buddi.api.spending.dto.RecurringSpendingResponse;
import com.buddi.api.spending.entity.RecurringSpending;
import com.buddi.api.spending.repository.RecurringSpendingRepository;
import com.buddi.api.user.entity.Category;
import com.buddi.api.user.entity.CategoryGroupMeta;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class RecurringSpendingCommandService {

    private final RecurringSpendingRepository recurringSpendingRepository;
    private final UserRepository userRepository;

    @Transactional
    public RecurringSpendingResponse create(Long userId, RecurringSpendingRequest request) {
        String[] nameAndGroup = resolveCategoryNameAndGroup(userId, request);
        RecurringSpending recurring = RecurringSpending.of(
                userId, request.getType(), nameAndGroup[0], nameAndGroup[1],
                request.getAmount(), request.getDayOfMonth(),
                request.getStartDate(), request.getEndDate(), request.getMemo());
        recurringSpendingRepository.save(recurring);
        return new RecurringSpendingResponse(recurring);
    }

    @Transactional
    public RecurringSpendingResponse update(Long userId, Long id, RecurringSpendingRequest request) {
        RecurringSpending recurring = getOwned(userId, id);
        String[] nameAndGroup = resolveCategoryNameAndGroup(userId, request);
        recurring.update(request.getType(), nameAndGroup[0], nameAndGroup[1],
                request.getAmount(), request.getDayOfMonth(),
                request.getStartDate(), request.getEndDate(), request.getMemo());
        return new RecurringSpendingResponse(recurring);
    }

    @Transactional
    public void delete(Long userId, Long id) {
        RecurringSpending recurring = getOwned(userId, id);
        recurringSpendingRepository.delete(recurring);
    }

    private String[] resolveCategoryNameAndGroup(Long userId, RecurringSpendingRequest request) {
        if (request.getCategoryId() != null) {
            Category category = getCategory(userId, request.getCategoryId());
            return new String[]{category.getName(), category.getParentGroupKey()};
        }
        String groupKey = request.getCategoryGroupKey();
        if (groupKey == null || groupKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "카테고리 또는 분류를 선택해주세요");
        }
        return new String[]{CategoryGroupMeta.labelOf(groupKey), groupKey};
    }

    private Category getCategory(Long userId, Long categoryId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        try {
            return user.findCategory(categoryId);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "유효하지 않은 카테고리입니다");
        }
    }

    private RecurringSpending getOwned(Long userId, Long id) {
        RecurringSpending recurring = recurringSpendingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "정기 지출이 존재하지 않습니다"));
        if (!recurring.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다");
        }
        return recurring;
    }
}
