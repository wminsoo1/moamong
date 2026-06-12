package com.buddi.api.spending.dto;

import com.buddi.api.spending.entity.Spending;
import com.buddi.api.user.entity.CategoryGroupMeta;
import lombok.Getter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Getter
public class RoomSpendingListResponse {
    private Long id;
    private String type;
    private String categoryName;
    private String categoryGroup;
    private String categoryGroupLabel;
    private Long amount;
    private LocalDate date;
    private String memo;
    private String imageUrl;
    private OffsetDateTime createdAt;
    private Long userId;
    private String username;
    private int commentCount;
    private int likeCount;
    private boolean liked;

    public RoomSpendingListResponse withLiked(boolean liked) {
        RoomSpendingListResponse r = new RoomSpendingListResponse();
        r.id = this.id; r.type = this.type; r.categoryName = this.categoryName;
        r.categoryGroup = this.categoryGroup; r.categoryGroupLabel = this.categoryGroupLabel;
        r.amount = this.amount; r.date = this.date; r.memo = this.memo;
        r.imageUrl = this.imageUrl; r.createdAt = this.createdAt;
        r.userId = this.userId; r.username = this.username;
        r.commentCount = this.commentCount; r.likeCount = this.likeCount;
        r.liked = liked;
        return r;
    }

    private RoomSpendingListResponse() {}

    public RoomSpendingListResponse(Spending spending, Long userId, String username) {
        this(spending, userId, username, 0, 0, false);
    }

    public RoomSpendingListResponse(Spending spending, Long userId, String username, int commentCount) {
        this(spending, userId, username, commentCount, 0, false);
    }

    public RoomSpendingListResponse(Spending spending, Long userId, String username, int commentCount, int likeCount, boolean liked) {
        this.id = spending.getId();
        this.type = spending.getType().name();
        this.categoryName = spending.getCategoryName();
        this.categoryGroup = spending.getCategoryGroup();
        this.categoryGroupLabel = CategoryGroupMeta.labelOf(spending.getCategoryGroup());
        this.amount = spending.getAmount();
        this.date = spending.getDate();
        this.memo = spending.getMemo();
        this.imageUrl = spending.getImageUrl();
        this.createdAt = spending.getCreatedAt() != null
                ? spending.getCreatedAt().atOffset(ZoneOffset.UTC)
                : null;
        this.userId = userId;
        this.username = username;
        this.commentCount = commentCount;
        this.likeCount = likeCount;
        this.liked = liked;
    }
}
