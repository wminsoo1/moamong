package com.buddi.api.spending.dto;

import lombok.Getter;

import java.time.LocalDate;
import java.util.List;

@Getter
public class WeeklyStatsResponse {

    private final int year;
    private final int month;
    private final long totalAmount;
    private final List<WeekEntry> weeks;

    public WeeklyStatsResponse(int year, int month, List<WeekEntry> weeks) {
        this.year = year;
        this.month = month;
        this.weeks = weeks;
        this.totalAmount = weeks.stream().mapToLong(WeekEntry::getAmount).sum();
    }

    @Getter
    public static class WeekEntry {
        private final int week;
        private final LocalDate startDate;
        private final LocalDate endDate;
        private final long amount;

        public WeekEntry(int week, LocalDate startDate, LocalDate endDate, long amount) {
            this.week = week;
            this.startDate = startDate;
            this.endDate = endDate;
            this.amount = amount;
        }
    }
}
