package com.buddi.api.spending.service;

import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.spending.entity.Spending;
import com.buddi.api.spending.repository.SpendingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SpendingLikeService {

    private final SpendingRepository spendingRepository;
    private final RoomQueryService roomQueryService;
    private final SpendingCacheService spendingCacheService;

    @Transactional
    public void toggleLike(Long roomId, Long spendingId, Long userId) {
        roomQueryService.validateMember(roomId, userId);
        Spending spending = spendingRepository.findByIdWithLikes(spendingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "지출이 없습니다"));
        boolean wasLiked = spending.isLikedBy(roomId, userId);
        spending.toggleLike(roomId, userId);
        spendingRepository.save(spending);
        if (wasLiked) {
            spendingCacheService.removeLike(userId, spendingId);
        } else {
            spendingCacheService.addLike(userId, spendingId);
        }
        spendingCacheService.evictMonthly(roomId, spending.getDate().getYear(), spending.getDate().getMonthValue());
    }
}
