package com.itda.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

// 구직자 공고 좋아요 엔티티
@Entity
@Table(name = "job_post_likes",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "job_post_id"}))
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 좋아요 누른 구직자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 좋아요 누른 공고
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_post_id", nullable = false)
    private JobPost jobPost;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}