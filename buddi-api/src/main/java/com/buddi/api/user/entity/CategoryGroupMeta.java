package com.buddi.api.user.entity;

import java.util.Map;

public class CategoryGroupMeta {

    private static final Map<String, String[]> META = Map.ofEntries(
            Map.entry("FOOD",         new String[]{"식비",         "#F97316", "Utensils"}),
            Map.entry("DAILY_GOODS",  new String[]{"생활",         "#06B6D4", "ShoppingBasket"}),
            Map.entry("FASHION",      new String[]{"쇼핑",         "#EC4899", "Shirt"}),
            Map.entry("HOUSING",      new String[]{"주거/통신",    "#3B82F6", "Home"}),
            Map.entry("TAX",          new String[]{"금융/보험",    "#10B981", "ShieldCheck"}),
            Map.entry("TRANSPORT",    new String[]{"교통/차량",    "#6366F1", "Bus"}),
            Map.entry("HEALTH",       new String[]{"의료/건강",    "#EF4444", "HeartPulse"}),
            Map.entry("LEISURE",      new String[]{"여가/취미",    "#8B5CF6", "Gamepad2"}),
            Map.entry("EDUCATION",    new String[]{"교육",         "#F59E0B", "GraduationCap"}),
            Map.entry("SOCIAL",       new String[]{"모임/선물",    "#E11D48", "Gift"}),
            Map.entry("TRAVEL",       new String[]{"여행",         "#14B8A6", "Plane"}),
            Map.entry("PETS",         new String[]{"반려동물",     "#D946EF", "PawPrint"}),
            Map.entry("BIG_SPENDING", new String[]{"대형지출",     "#71717A", "Tv"}),
            Map.entry("EMPLOYMENT",   new String[]{"근로소득",     "#F59E0B", "Banknote"}),
            Map.entry("INVESTMENT",   new String[]{"투자/재테크",  "#3B82F6", "TrendingUp"}),
            Map.entry("PENSION",      new String[]{"연금/수당",    "#607D8B", "PiggyBank"}),
            Map.entry("MISC",         new String[]{"기타",         "#9CA3AF", "MoreHorizontal"}),
            Map.entry("ETC",          new String[]{"기타",         "#6B7280", "Coins"})
    );

    private static String[] get(String group) {
        return META.getOrDefault(group, META.get("ETC"));
    }

    public static String labelOf(String group) { return get(group)[0]; }
    public static String colorOf(String group)  { return get(group)[1]; }
    public static String iconOf(String group)   { return get(group)[2]; }
}
