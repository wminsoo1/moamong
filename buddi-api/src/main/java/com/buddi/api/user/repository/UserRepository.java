package com.buddi.api.user.repository;

import com.buddi.api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    @Query("SELECT uc.card.id FROM UserCard uc WHERE uc.user.id = :userId")
    List<Long> findCardIdsByUserId(@Param("userId") Long userId);
}
