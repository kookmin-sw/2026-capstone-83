package com.itda.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 공고 클릭(상세 진입) 로그.
 *
 * 한 줄 = 한 사용자가 한 공고 상세 페이지로 진입한 사건.
 *
 * - request_id: 클라이언트가 노출 당시 응답 헤더(X-Request-Id) 로 받았던 값을
 *   상세 호출 시 헤더 또는 쿼리로 되돌려 보내면 그대로 적재 — NDCG 조인의 핵심
 * - request_id 가 없어도 (user_id, post_id, at) 시간 윈도우 조인으로 매칭 가능
 * - referrer_sort_type: 어떤 정렬 화면에서 진입했는지 (RECOMMENDED / WAGE / ...)
 */
@Entity
@Table(name = "job_post_click_logs",
        indexes = {
                @Index(name = "idx_clk_request", columnList = "request_id"),
                @Index(name = "idx_clk_user_at", columnList = "user_id, at"),
                @Index(name = "idx_clk_post_at", columnList = "post_id, at"),
                @Index(name = "idx_clk_at",      columnList = "at")
        })
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostClickLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "referrer_sort_type", length = 20)
    private String referrerSortType;

    @Column(name = "request_id", length = 36)
    private String requestId;

    @Column(name = "at", nullable = false)
    private LocalDateTime at;
}
