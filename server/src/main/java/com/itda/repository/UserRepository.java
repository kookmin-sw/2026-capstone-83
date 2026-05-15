package com.itda.repository;

import com.itda.entity.User;
import com.itda.enums.OAuthProvider;
import com.itda.enums.UserRole;
import com.itda.enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByOauthProviderAndOauthProviderId(OAuthProvider oauthProvider, String oauthProviderId);
    Optional<User> findByLoginId(String loginId);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    // 매니저용: 회원 검색 (이름 또는 이메일 부분 일치, 역할/상태 필터)
    @Query("SELECT u FROM User u WHERE " +
            "(:keyword IS NULL OR u.name LIKE %:keyword% OR u.email LIKE %:keyword%) " +
            "AND (:role IS NULL OR u.role = :role) " +
            "AND (:status IS NULL OR u.status = :status) " +
            "ORDER BY u.createdAt DESC")
    Page<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("role") UserRole role,
            @Param("status") UserStatus status,
            Pageable pageable);

    // 정지 기간 만료된 유저 조회 (스케줄러용)
    List<User> findByStatusAndSuspendedUntilBefore(UserStatus status, LocalDateTime now);
}