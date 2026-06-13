package com.buddi.api.spending.service;

import com.buddi.api.room.dto.RoomMemberResponse;
import com.buddi.api.room.service.RoomQueryService;
import com.buddi.api.spending.dto.CategoryAmountDto;
import com.buddi.api.spending.dto.CategoryStatsResponse;
import com.buddi.api.spending.dto.RoomSpendingListResponse;
import com.buddi.api.spending.dto.SpendingListResponse;
import com.buddi.api.spending.dto.WeeklyAmountDto;
import com.buddi.api.spending.dto.WeeklyStatsResponse;
import com.buddi.api.spending.entity.Spending;
import com.buddi.api.spending.entity.SpendingType;
import com.buddi.api.spending.repository.SpendingRepository;
import com.buddi.api.user.entity.CategoryGroupMeta;
import com.buddi.api.user.service.UserQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class SpendingQueryService {

    private final SpendingRepository spendingRepository;
    private final RoomQueryService roomQueryService;
    private final UserQueryService userQueryService;
    private final SpendingCacheService spendingCacheService;

    @Transactional(readOnly = true)
    public List<RoomSpendingListResponse> getRoomMonthly(Long viewerId, Long roomId, int year, int month) {
        roomQueryService.validateMember(roomId, viewerId);

        List<RoomSpendingListResponse> base = spendingCacheService.getMonthly(roomId, year, month,
                k -> loadBaseMonthly(roomId, year, month));

        if (base.isEmpty()) return base;
        List<Long> spendingIds = base.stream().map(RoomSpendingListResponse::getId).toList();
        Set<Long> likedIds = spendingCacheService.getUserLikes(viewerId, roomId,
                () -> spendingRepository.findLikedSpendingIdsByUserIdAndRoomId(viewerId, spendingIds, roomId));

        return base.stream()
                .map(item -> likedIds.contains(item.getId()) ? item.withLiked(true) : item)
                .toList();
    }

    private List<RoomSpendingListResponse> loadBaseMonthly(Long roomId, int year, int month) {
        List<RoomMemberResponse> members = roomQueryService.getMembers(roomId);
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        record SpendingWithMember(Spending spending, Long userId, String username) {}

        List<SpendingWithMember> all = members.stream()
                .flatMap(member -> {
                    List<String> hidden = userQueryService.getHiddenCategoryGroups(member.userId());
                    return spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(member.userId(), start, end)
                            .stream()
                            .filter(s -> s.getType() == SpendingType.EXPENSE)
                            .filter(s -> !hidden.contains(s.getCategoryGroup()))
                            .map(s -> new SpendingWithMember(s, member.userId(), member.username()));
                })
                .toList();

        List<Long> ids = all.stream().map(sm -> sm.spending().getId()).toList();
        Map<Long, Integer> commentCounts = ids.isEmpty() ? Map.of() :
                spendingRepository.countCommentsBySpendingIdInAndRoomId(ids, roomId).stream()
                        .collect(Collectors.toMap(row -> (Long) row[0], row -> ((Long) row[1]).intValue()));
        Map<Long, Integer> likeCounts = ids.isEmpty() ? Map.of() :
                spendingRepository.countLikesBySpendingIdInAndRoomId(ids, roomId).stream()
                        .collect(Collectors.toMap(row -> (Long) row[0], row -> ((Long) row[1]).intValue()));

        return all.stream()
                .map(sm -> new RoomSpendingListResponse(sm.spending(), sm.userId(), sm.username(),
                        commentCounts.getOrDefault(sm.spending().getId(), 0),
                        likeCounts.getOrDefault(sm.spending().getId(), 0),
                        false))
                .sorted(Comparator.<RoomSpendingListResponse, java.time.LocalDate>comparing(RoomSpendingListResponse::getDate).reversed()
                        .thenComparing(r -> r.getCreatedAt() != null ? r.getCreatedAt() : java.time.OffsetDateTime.MIN,
                                Comparator.reverseOrder()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SpendingListResponse> getMemberMonthly(Long viewerId, Long targetUserId, int year, int month) {
        if (!roomQueryService.existsSharedRoom(viewerId, targetUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "같은 방에 있지 않습니다");
        }
        List<String> hidden = userQueryService.getHiddenCategoryGroups(targetUserId);
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(targetUserId, start, end)
                .stream()
                .filter(s -> s.getType() == com.buddi.api.spending.entity.SpendingType.EXPENSE)
                .filter(s -> !hidden.contains(s.getCategoryGroup()))
                .map(SpendingListResponse::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SpendingListResponse> getMonthly(Long userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        return spendingRepository.findByUserIdAndDateBetweenOrderByDateDesc(userId, start, end)
                .stream().map(SpendingListResponse::new).toList();
    }

    @Transactional(readOnly = true)
    public CategoryStatsResponse getCategoryStats(Long userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());
        LocalDate lastStart = start.minusMonths(1);
        LocalDate lastEnd = lastStart.withDayOfMonth(lastStart.lengthOfMonth());

        List<CategoryAmountDto> current = spendingRepository.sumAmountByCategory(userId, start, end);
        List<CategoryAmountDto> lastMonth = spendingRepository.sumAmountByCategory(userId, lastStart, lastEnd);

        long total = current.stream().mapToLong(CategoryAmountDto::amount).sum();
        long lastTotal = lastMonth.stream().mapToLong(CategoryAmountDto::amount).sum();

        Map<String, Long> lastMonthMap = lastMonth.stream()
                .collect(Collectors.toMap(CategoryAmountDto::categoryGroup, CategoryAmountDto::amount));

        List<CategoryStatsResponse.CategoryEntry> categories = current.stream()
                .map(d -> {
                    double percentage = total == 0 ? 0 : Math.round(d.amount() * 1000.0 / total) / 10.0;
                    long lastMonthAmount = lastMonthMap.getOrDefault(d.categoryGroup(), 0L);
                    return new CategoryStatsResponse.CategoryEntry(
                            d.categoryGroup(),
                            CategoryGroupMeta.labelOf(d.categoryGroup()),
                            d.amount(),
                            d.count(),
                            percentage,
                            lastMonthAmount);
                })
                .toList();

        return new CategoryStatsResponse(year, month, total, lastTotal, categories);
    }

    @Transactional(readOnly = true)
    public WeeklyStatsResponse getWeeklyStats(Long userId, int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        Map<Integer, Long> sumByWeek = spendingRepository
                .sumAmountByWeek(userId, start, end)
                .stream()
                .collect(Collectors.toMap(w -> w.week(), w -> w.amount()));

        int totalWeeks = weekOfMonth(end);
        List<WeeklyStatsResponse.WeekEntry> weeks = IntStream.rangeClosed(1, totalWeeks)
                .mapToObj(w -> {
                    LocalDate weekStart = start.plusDays((long) (w - 1) * 7);
                    LocalDate weekEnd = weekStart.plusDays(6).isAfter(end) ? end : weekStart.plusDays(6);
                    return new WeeklyStatsResponse.WeekEntry(w, weekStart, weekEnd,
                            sumByWeek.getOrDefault(w, 0L));
                })
                .toList();

        return new WeeklyStatsResponse(year, month, weeks);
    }

    @Transactional(readOnly = true)
    public Optional<Spending> findLatestSpending(List<Long> userIds) {
        if (userIds.isEmpty()) return Optional.empty();
        return spendingRepository.findTopByUserIdInAndTypeOrderByCreatedAtDesc(userIds, SpendingType.EXPENSE);
    }

    @Transactional(readOnly = true)
    public long countUnreadSpendings(List<Long> memberIds, LocalDateTime since) {
        if (memberIds.isEmpty()) return 0;
        return spendingRepository.countByUserIdsAndCreatedAtAfter(memberIds, since);
    }

    private int weekOfMonth(LocalDate date) {
        return (date.getDayOfMonth() - 1) / 7 + 1;
    }
}
