package com.itda.repository;

import com.itda.entity.User;
import com.itda.enums.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByOauthProviderAndOauthProviderId(OAuthProvider oauthProvider, String oauthProviderId);
    Optional<User> findByLoginId(String loginId);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}