package com.buddi.api.user.entity;

import com.buddi.api.spending.entity.SpendingType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "categories")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_group_id", nullable = false)
    private CategoryGroup categoryGroup;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpendingType type;

    @Column(nullable = false)
    private int sortOrder = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public String getParentGroupKey() {
        return categoryGroup.getGroupKey();
    }

    public void updateName(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("카테고리 이름을 입력해주세요");
        if (name.length() > 10) throw new IllegalArgumentException("카테고리 이름은 10자 이하로 입력해주세요");
        this.name = name;
    }

    public void updateSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    static Category of(CategoryGroup categoryGroup, String name, SpendingType type, int sortOrder) {
        Category c = new Category();
        c.categoryGroup = categoryGroup;
        c.name = name;
        c.type = type;
        c.sortOrder = sortOrder;
        return c;
    }
}
