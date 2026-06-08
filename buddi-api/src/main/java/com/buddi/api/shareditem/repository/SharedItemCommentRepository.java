package com.buddi.api.shareditem.repository;

import com.buddi.api.shareditem.entity.SharedItemComment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SharedItemCommentRepository extends JpaRepository<SharedItemComment, Long> {
}
