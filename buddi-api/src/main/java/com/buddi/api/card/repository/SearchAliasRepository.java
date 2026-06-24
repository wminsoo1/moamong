package com.buddi.api.card.repository;

import com.buddi.api.card.entity.SearchAlias;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SearchAliasRepository extends JpaRepository<SearchAlias, Long> {

    List<SearchAlias> findByKeywordContaining(String keyword);
}
