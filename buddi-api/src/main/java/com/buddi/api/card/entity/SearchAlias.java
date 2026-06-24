package com.buddi.api.card.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "search_aliases")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SearchAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String keyword;

    @Column(nullable = false)
    private String category;

    private String merchant;

    public static SearchAlias of(String keyword, String category, String merchant) {
        if (keyword == null || keyword.isBlank()) throw new IllegalArgumentException("검색 키워드를 입력해주세요");
        if (category == null || category.isBlank()) throw new IllegalArgumentException("카테고리를 입력해주세요");

        SearchAlias alias = new SearchAlias();
        alias.keyword = keyword;
        alias.category = category;
        alias.merchant = merchant;
        return alias;
    }
}
