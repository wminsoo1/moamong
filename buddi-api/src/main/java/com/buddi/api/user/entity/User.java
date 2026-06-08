package com.buddi.api.user.entity;

import com.buddi.api.spending.entity.SpendingType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String provider;

    @Column(nullable = false)
    private String providerId;

    @Column(nullable = false)
    private String nickname;

    @Column(unique = true)
    private String username;

    @Column
    private String fcmToken;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean isNotificationEnabled = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @Column
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CategoryGroup> categoryGroups = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "user_share_rooms", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "room_id")
    private Set<Long> shareRoomIds = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "user_hidden_categories", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "category_group")
    private Set<String> hiddenCategoryGroups = new HashSet<>();

    @Builder(access = AccessLevel.PRIVATE)
    private User(String provider, String providerId, String nickname) {
        this.provider = provider;
        this.providerId = providerId;
        this.nickname = nickname;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public static User createWithDefaults(String provider, String providerId, String nickname) {
        return User.builder()
                .provider(provider)
                .providerId(providerId)
                .nickname(nickname)
                .build();
    }

    public void update(String nickname) {
        this.nickname = nickname;
    }

    public void assignUsername(String username) {
        if (username == null || !username.matches("^[a-zA-Z0-9_\\uAC00-\\uD7A3]{2,20}$")) {
            throw new IllegalArgumentException("2~20자, 한글/영문/숫자/언더스코어만 사용 가능합니다");
        }
        this.username = username;
    }

    public void updateFcmToken(String fcmToken) {
        this.fcmToken = fcmToken;
    }

    public void updateNotificationSetting(boolean enabled) {
        this.isNotificationEnabled = enabled;
    }

    public void clearFcmToken() {
        this.fcmToken = null;
    }

    public void deactivate() {
        this.deletedAt = LocalDateTime.now();
        this.fcmToken = null;
    }

    public void anonymize() {
        this.deletedAt = LocalDateTime.now();
        this.fcmToken = null;
        this.nickname = "탈퇴한 사용자";
        this.username = null;
        // providerId를 변경해 재로그인 시 기존 계정과 연결 안 되도록
        this.providerId = "deleted_" + this.id;
    }

    public void reactivate() {
        this.deletedAt = null;
    }

    public List<Long> getShareRoomIds() {
        return new ArrayList<>(shareRoomIds);
    }

    public void updateShareRoomIds(List<Long> roomIds) {
        this.shareRoomIds.clear();
        this.shareRoomIds.addAll(roomIds);
    }

    public List<String> getHiddenCategoryGroups() {
        return new ArrayList<>(hiddenCategoryGroups);
    }

    public void updateHiddenCategoryGroups(List<String> groups) {
        this.hiddenCategoryGroups.clear();
        this.hiddenCategoryGroups.addAll(groups);
    }

    public boolean isDeleted() {
        return this.deletedAt != null;
    }

    private static final List<String> DEFAULT_GROUP_ORDER = List.of(
            "FOOD", "DAILY_GOODS", "FASHION", "HOUSING", "TAX", "TRANSPORT", "HEALTH",
            "LEISURE", "EDUCATION", "SOCIAL", "TRAVEL", "PETS", "BIG_SPENDING", "MISC",
            "EMPLOYMENT", "INVESTMENT", "PENSION", "ETC"
    );

    public void initDefaults() {
        for (int i = 0; i < DEFAULT_GROUP_ORDER.size(); i++) {
            String key = DEFAULT_GROUP_ORDER.get(i);
            categoryGroups.add(CategoryGroup.of(this, key,
                    CategoryGroupMeta.colorOf(key), CategoryGroupMeta.iconOf(key), i));
        }
        // 식비
        addCategory("식사",       SpendingType.EXPENSE, "FOOD");
        addCategory("카페",       SpendingType.EXPENSE, "FOOD");
        addCategory("장보기",     SpendingType.EXPENSE, "FOOD");
        // 생활
        addCategory("생필품",     SpendingType.EXPENSE, "DAILY_GOODS");
        addCategory("생활서비스", SpendingType.EXPENSE, "DAILY_GOODS");
        // 쇼핑
        addCategory("의류",       SpendingType.EXPENSE, "FASHION");
        addCategory("미용",       SpendingType.EXPENSE, "FASHION");
        addCategory("기타쇼핑",   SpendingType.EXPENSE, "FASHION");
        // 주거/통신
        addCategory("월세",       SpendingType.EXPENSE, "HOUSING");
        addCategory("공과금",     SpendingType.EXPENSE, "HOUSING");
        addCategory("통신",       SpendingType.EXPENSE, "HOUSING");
        // 금융/보험
        addCategory("보험",       SpendingType.EXPENSE, "TAX");
        addCategory("이자",       SpendingType.EXPENSE, "TAX");
        addCategory("세금",       SpendingType.EXPENSE, "TAX");
        // 교통/차량
        addCategory("대중교통",   SpendingType.EXPENSE, "TRANSPORT");
        addCategory("차량",       SpendingType.EXPENSE, "TRANSPORT");
        // 의료/건강
        addCategory("병원",       SpendingType.EXPENSE, "HEALTH");
        addCategory("건강관리",   SpendingType.EXPENSE, "HEALTH");
        // 여가/취미
        addCategory("문화생활",   SpendingType.EXPENSE, "LEISURE");
        addCategory("게임",       SpendingType.EXPENSE, "LEISURE");
        addCategory("취미",       SpendingType.EXPENSE, "LEISURE");
        // 교육
        addCategory("학원/강의",  SpendingType.EXPENSE, "EDUCATION");
        addCategory("시험/자격증",SpendingType.EXPENSE, "EDUCATION");
        addCategory("도서",       SpendingType.EXPENSE, "EDUCATION");
        // 모임/선물
        addCategory("모임",       SpendingType.EXPENSE, "SOCIAL");
        addCategory("선물",       SpendingType.EXPENSE, "SOCIAL");
        addCategory("경조사",     SpendingType.EXPENSE, "SOCIAL");
        // 여행
        addCategory("국내",       SpendingType.EXPENSE, "TRAVEL");
        addCategory("해외",       SpendingType.EXPENSE, "TRAVEL");
        // 반려동물
        addCategory("사료/간식",  SpendingType.EXPENSE, "PETS");
        addCategory("병원",       SpendingType.EXPENSE, "PETS");
        addCategory("용품",       SpendingType.EXPENSE, "PETS");
        // 대형지출
        addCategory("가전",       SpendingType.EXPENSE, "BIG_SPENDING");
        addCategory("가구",       SpendingType.EXPENSE, "BIG_SPENDING");
        addCategory("전자기기",   SpendingType.EXPENSE, "BIG_SPENDING");
        // 기타지출
        addCategory("기타",       SpendingType.EXPENSE, "MISC");

        // 근로소득
        addCategory("월급",       SpendingType.INCOME,  "EMPLOYMENT");
        addCategory("보너스",     SpendingType.INCOME,  "EMPLOYMENT");
        addCategory("성과급",     SpendingType.INCOME,  "EMPLOYMENT");
        addCategory("식대/교통비",SpendingType.INCOME,  "EMPLOYMENT");
        // 투자/재테크
        addCategory("주식/펀드",  SpendingType.INCOME,  "INVESTMENT");
        addCategory("은행이자",   SpendingType.INCOME,  "INVESTMENT");
        addCategory("배당금",     SpendingType.INCOME,  "INVESTMENT");
        addCategory("환차익",     SpendingType.INCOME,  "INVESTMENT");
        addCategory("임대수익",   SpendingType.INCOME,  "INVESTMENT");
        // 연금/수당
        addCategory("국민연금",   SpendingType.INCOME,  "PENSION");
        addCategory("퇴직연금",   SpendingType.INCOME,  "PENSION");
        addCategory("정부지원금", SpendingType.INCOME,  "PENSION");
        addCategory("실업급여",   SpendingType.INCOME,  "PENSION");
        addCategory("보험환급",   SpendingType.INCOME,  "PENSION");
        // 기타수입
        addCategory("용돈",       SpendingType.INCOME,  "ETC");
        addCategory("중고판매",   SpendingType.INCOME,  "ETC");
        addCategory("경품/상금",  SpendingType.INCOME,  "ETC");
        addCategory("환급금",     SpendingType.INCOME,  "ETC");
        addCategory("생일용돈",   SpendingType.INCOME,  "ETC");
        addCategory("기타수입",   SpendingType.INCOME,  "ETC");
    }

    public Category addCategory(String name, SpendingType type, String groupKey) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("카테고리 이름을 입력해주세요");
        if (name.length() > 10) throw new IllegalArgumentException("카테고리 이름은 10자 이하로 입력해주세요");
        CategoryGroup group = findCategoryGroup(groupKey);
        return group.addCategory(name, type);
    }

    public Category findCategory(Long categoryId) {
        return categoryGroups.stream()
                .flatMap(g -> g.getCategories().stream())
                .filter(c -> c.getId().equals(categoryId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다"));
    }

    public List<Category> getCategories() {
        return categoryGroups.stream()
                .flatMap(g -> g.getCategories().stream())
                .collect(java.util.stream.Collectors.toList());
    }

    public Category updateCategoryName(Long categoryId, String name) {
        Category category = findCategory(categoryId);
        boolean duplicate = category.getCategoryGroup().getCategories().stream()
                .filter(c -> !c.getId().equals(categoryId))
                .anyMatch(c -> c.getName().equals(name) && c.getType() == category.getType());
        if (duplicate) throw new IllegalStateException("같은 분류에 동일한 이름의 카테고리가 이미 존재합니다");
        category.updateName(name);
        return category;
    }

    public void removeCategory(Long categoryId) {
        for (CategoryGroup group : categoryGroups) {
            if (group.getCategories().removeIf(c -> c.getId().equals(categoryId))) return;
        }
        throw new IllegalArgumentException("카테고리를 찾을 수 없습니다");
    }

    public void reorderCategories(List<Long> orderedIds) {
        for (int i = 0; i < orderedIds.size(); i++) {
            final int order = i;
            Long targetId = orderedIds.get(i);
            categoryGroups.stream()
                    .flatMap(g -> g.getCategories().stream())
                    .filter(c -> c.getId().equals(targetId))
                    .findFirst()
                    .ifPresent(c -> c.updateSortOrder(order));
        }
    }

    public CategoryGroup findCategoryGroup(String groupKey) {
        return categoryGroups.stream()
                .filter(g -> g.getGroupKey().equals(groupKey))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("그룹을 찾을 수 없습니다: " + groupKey));
    }

    public CategoryGroup updateCategoryGroup(String groupKey, String color, String icon) {
        CategoryGroup group = findCategoryGroup(groupKey);
        group.updateStyle(color, icon);
        return group;
    }

    public void reorderCategoryGroups(List<String> orderedKeys) {
        for (int i = 0; i < orderedKeys.size(); i++) {
            final int order = i;
            String key = orderedKeys.get(i);
            categoryGroups.stream()
                    .filter(g -> g.getGroupKey().equals(key))
                    .findFirst()
                    .ifPresent(g -> g.updateSortOrder(order));
        }
    }
}
