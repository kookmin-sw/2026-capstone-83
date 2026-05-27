package com.itda.entity;

import com.itda.enums.OAuthProvider;
import com.itda.enums.UserRole;
import com.itda.enums.UserStatus;
import com.itda.converter.GenderConverter;
import com.itda.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Builder;
import lombok.AllArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users",
        uniqueConstraints = @UniqueConstraint(columnNames = {"oauth_provider", "oauth_provider_id"}))
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "oauth_provider", length = 10)
    private OAuthProvider oauthProvider;

    @Column(name = "oauth_provider_id", length = 100)
    private String oauthProviderId;

    @Column(name = "login_id", unique = true, length = 50)
    private String loginId;

    @Column(length = 255)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(name = "birth")
    private LocalDate birth;

    @Convert(converter = GenderConverter.class)
    @Column(name = "gender")
    private Gender gender;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private UserRole role;

    // 회원 상태 (정상 / 정지)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    // 정지 시작일
    @Column(name = "suspended_at")
    private LocalDateTime suspendedAt;

    // 정지 해제일 (null이면 영구정지)
    @Column(name = "suspended_until")
    private LocalDateTime suspendedUntil;

    // 정지 사유
    @Column(name = "suspend_reason", length = 500)
    private String suspendReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = UserStatus.ACTIVE;
        }
    }

    /**
     * 회원 정지 처리
     * @param days 정지 일수 (0이면 영구정지)
     * @param reason 정지 사유
     */
    public void suspend(int days, String reason) {
        this.status = UserStatus.SUSPENDED;
        this.suspendedAt = LocalDateTime.now();
        this.suspendedUntil = (days > 0) ? LocalDateTime.now().plusDays(days) : null;
        this.suspendReason = reason;
    }

    /**
     * 정지 해제
     */
    public void activate() {
        this.status = UserStatus.ACTIVE;
        this.suspendedAt = null;
        this.suspendedUntil = null;
        this.suspendReason = null;
    }

    /**
     * 정지 기간이 만료되었는지 확인
     */
    public boolean isSuspensionExpired() {
        if (this.status != UserStatus.SUSPENDED) return false;
        if (this.suspendedUntil == null) return false; // 영구정지는 만료 안됨
        return LocalDateTime.now().isAfter(this.suspendedUntil);
    }
}
