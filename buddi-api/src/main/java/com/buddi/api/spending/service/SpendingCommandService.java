package com.buddi.api.spending.service;

import com.buddi.api.global.s3.PresignedUrlService;
import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.spending.dto.SpendingRequest;
import com.buddi.api.spending.dto.SpendingResponse;
import com.buddi.api.spending.entity.Spending;
import com.buddi.api.spending.entity.SpendingType;
import com.buddi.api.spending.notification.event.SpendingCreatedEvent;
import com.buddi.api.spending.repository.SpendingRepository;
import com.buddi.api.user.entity.Category;
import com.buddi.api.user.entity.CategoryGroupMeta;
import com.buddi.api.user.entity.User;
import com.buddi.api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class SpendingCommandService {

    private final SpendingRepository spendingRepository;
    private final UserRepository userRepository;
    private final PresignedUrlService presignedUrlService;
    private final ApplicationEventPublisher eventPublisher;
    private final RoomQueryService roomQueryService;
    private final SpendingCacheService spendingCacheService;

    @Transactional
    public SpendingResponse create(Long userId, SpendingRequest request) {
        String[] nameAndGroup = resolveCategoryNameAndGroup(userId, request);
        Spending spending = Spending.of(userId, request.getType(),
                nameAndGroup[0], nameAndGroup[1],
                request.getAmount(), request.getDate(), request.getMemo(), request.getImageUrl());
        spendingRepository.save(spending);
        if (spending.getType() == SpendingType.EXPENSE) {
            eventPublisher.publishEvent(new SpendingCreatedEvent(
                    spending.getId(), userId, spending.getAmount(), spending.getCategoryName(), spending.getMemo()));
        }
        evictRoomMonthlyCache(userId, spending.getDate());
        return new SpendingResponse(spending);
    }

    @Transactional
    public SpendingResponse update(Long userId, Long spendingId, SpendingRequest request) {
        Spending spending = getOwnedSpending(userId, spendingId);
        LocalDate oldDate = spending.getDate();
        String oldImageUrl = spending.getImageUrl();
        String newImageUrl = request.getImageUrl();
        String[] nameAndGroup = resolveCategoryNameAndGroup(userId, request);
        spending.update(request.getType(), nameAndGroup[0], nameAndGroup[1],
                request.getAmount(), request.getDate(), request.getMemo(), newImageUrl);
        if (oldImageUrl != null && !oldImageUrl.equals(newImageUrl)) {
            presignedUrlService.deleteByUrl(oldImageUrl);
        }
        evictRoomMonthlyCache(userId, oldDate);
        if (!oldDate.equals(spending.getDate())) {
            evictRoomMonthlyCache(userId, spending.getDate());
        }
        return new SpendingResponse(spending);
    }

    private String[] resolveCategoryNameAndGroup(Long userId, SpendingRequest request) {
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

    @Transactional
    public void delete(Long userId, Long spendingId) {
        Spending spending = getOwnedSpending(userId, spendingId);
        LocalDate date = spending.getDate();
        presignedUrlService.deleteByUrl(spending.getImageUrl());
        spendingRepository.delete(spending);
        evictRoomMonthlyCache(userId, date);
    }

    private void evictRoomMonthlyCache(Long userId, LocalDate date) {
        roomQueryService.getRoomIds(userId).forEach(roomId ->
                spendingCacheService.evictMonthly(roomId, date.getYear(), date.getMonthValue()));
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

    private Spending getOwnedSpending(Long userId, Long spendingId) {
        Spending spending = spendingRepository.findById(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 존재하지 않습니다"));
        if (!spending.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "권한이 없습니다");
        }
        return spending;
    }
}
