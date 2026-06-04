package com.buddi.api.spending.service;

import com.buddi.api.spending.dto.CategoryAmountDto;
import com.buddi.api.spending.dto.CategoryStatsResponse;
import com.buddi.api.spending.dto.SpendingListResponse;
import com.buddi.api.spending.dto.WeeklyAmountDto;
import com.buddi.api.spending.dto.WeeklyStatsResponse;
import com.buddi.api.spending.repository.SpendingRepository;
import com.buddi.api.user.entity.CategoryGroupMeta;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class SpendingQueryService {

    private final SpendingRepository spendingRepository;

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

    private int weekOfMonth(LocalDate date) {
        return (date.getDayOfMonth() - 1) / 7 + 1;
    }
}
