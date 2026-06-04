package com.buddi.api.user.entity;

import com.buddi.api.spending.entity.SpendingType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category_groups",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "group_key"}))
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CategoryGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "group_key", nullable = false)
    private String groupKey;

    @Column(nullable = false)
    private String color;

    @Column(nullable = false)
    private String icon;

    @Column(nullable = false)
    private int sortOrder;

    @OneToMany(mappedBy = "categoryGroup", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Category> categories = new ArrayList<>();

    static CategoryGroup of(User user, String groupKey, String color, String icon, int sortOrder) {
        CategoryGroup g = new CategoryGroup();
        g.user = user;
        g.groupKey = groupKey;
        g.color = color;
        g.icon = icon;
        g.sortOrder = sortOrder;
        return g;
    }

    public void updateStyle(String color, String icon) {
        if (color == null || !color.matches("^#[0-9A-Fa-f]{6}$"))
            throw new IllegalArgumentException("올바른 색상 코드를 입력해주세요 (예: #F97316)");
        if (icon == null || icon.isBlank())
            throw new IllegalArgumentException("아이콘을 입력해주세요");
        this.color = color;
        this.icon = icon;
    }

    public void updateSortOrder(int sortOrder) {
        this.sortOrder = sortOrder;
    }

    Category addCategory(String name, SpendingType type) {
        boolean duplicate = categories.stream()
                .anyMatch(c -> c.getName().equals(name) && c.getType() == type);
        if (duplicate) throw new IllegalStateException("같은 분류에 동일한 이름의 카테고리가 이미 존재합니다");
        long nonEtcCount = categories.stream()
                .filter(c -> c.getType() == type && !c.getName().startsWith("기타"))
                .count();
        int order = (int) nonEtcCount;
        categories.stream()
                .filter(c -> c.getType() == type && c.getName().startsWith("기타"))
                .forEach(c -> c.updateSortOrder(order + 1));
        Category category = Category.of(this, name, type, order);
        categories.add(category);
        return category;
    }
}
