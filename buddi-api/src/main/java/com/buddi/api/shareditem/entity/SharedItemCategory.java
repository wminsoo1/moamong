package com.buddi.api.shareditem.entity;

public enum SharedItemCategory {
    FASHION("패션/의류",  "👗", "#E11D48"),
    BEAUTY("뷰티/헬스",   "💄", "#EC4899"),
    FOOD("식품/음료",     "🍔", "#F97316"),
    ELECTRONICS("가전/디지털", "💻", "#3B82F6"),
    SPORTS("스포츠/레저", "⚽", "#10B981"),
    HOME("홈/리빙",       "🏠", "#F59E0B"),
    ETC("기타",           "📦", "#6B7280");

    private final String name;
    private final String emoji;
    private final String color;

    SharedItemCategory(String name, String emoji, String color) {
        this.name = name;
        this.emoji = emoji;
        this.color = color;
    }

    public String getName()  { return name; }
    public String getEmoji() { return emoji; }
    public String getColor() { return color; }
}
