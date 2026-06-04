package com.buddi.api.user.repository;

import com.buddi.api.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByProviderAndProviderId(String provider, String providerId);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
}
