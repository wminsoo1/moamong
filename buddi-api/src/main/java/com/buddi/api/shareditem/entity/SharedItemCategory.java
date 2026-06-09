package com.buddi.api.shareditem.entity;

public enum SharedItemCategory {
    ELECTRONICS("전자/IT",      "💻", "#3B82F6"),
    FOOD("식품/영양제",          "🍔", "#F97316"),
    BEAUTY("뷰티/패션",          "💄", "#EC4899"),
    EVENT("이벤트/상품권",       "🎁", "#E11D48"),
    GAME("게임/앱",              "🎮", "#8B5CF6"),
    ETC("기타",                  "📦", "#6B7280");

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
