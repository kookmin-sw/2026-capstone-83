package com.itda.entity;

import com.itda.converter.ReviewTagListConverter;
import com.itda.enums.ReviewTag;
import com.itda.enums.ReviewTarget;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 리뷰 Entity
 * - 구직자 → 사업장 또는 고용주 → 구직자 방향 리뷰
 * - COMPLETED 상태의 application에만 작성 가능 (서비스 레이어에서 검증)
 * - application당 target 방향으로 1개만 허용 (unique constraint)
 */
@Entity
@Table(
        name = "reviews",
        uniqueConstraints = @UniqueConstraint(columnNames = {"application_id", "target"})
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 리뷰 대상 application (COMPLETED 상태여야 함) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    /** 리뷰 작성자 */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    /** 리뷰 방향 (구직자→사업장 / 고용주→구직자) */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReviewTarget target;

    /** 수정 메서드 */
    public void update(Application application, List<ReviewTag> tags, String content) {
        this.application = application;
        this.tags = tags;
        this.content = content;
    }
    /**
     * 선택된 태그 목록 (콤마 구분 문자열로 저장)
     * ex) "GOOD_PAY,KIND_EMPLOYER"
     */
    @Convert(converter = ReviewTagListConverter.class)
    @Column(name = "tags", length = 500)
    private List<ReviewTag> tags;

    /** 텍스트 리뷰 (선택, 최대 500자) */
    @Column(name = "content", length = 500)
    private String content;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
