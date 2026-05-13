package com.itda.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// 고용주 이력서 좋아요 엔티티
@Entity
@Table(name = "resume_likes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"employer_user_id", "resume_id"}))
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 좋아요 누른 고용주
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employer_user_id", nullable = false)
    private User employerUser;

    // 좋아요 누른 이력서
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}