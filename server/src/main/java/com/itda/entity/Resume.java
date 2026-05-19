package com.itda.entity;

import com.itda.enums.Education;
import com.itda.enums.EducationStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// 구직자 이력서 엔티티 (1인 1개)
@Entity
@Table(name = "resumes")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 이력서 소유자 (users 테이블 참조, 1:1 관계)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // 최종 학력 (HIGH/COLLEGE/UNIVERSITY/GRADUATE)
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private Education education;

    // 재학 상태 (ENROLLED/GRADUATED/EXPECTED/DROPPED/LEAVE)
    @Enumerated(EnumType.STRING)
    @Column(nullable = true)
    private EducationStatus educationStatus;

    // 전공
    @Column(nullable = true)
    private String major;

    // 이력서 증명사진 S3 URL
    @Column(name = "photo_url", length = 500, nullable = true)
    private String photoUrl;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}