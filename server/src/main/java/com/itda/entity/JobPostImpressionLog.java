package com.itda.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * 공고 노출(impression) 로그.
 *
 * 한 줄 = 한 사용자에게 한 공고가 한 응답에서 한 번 노출된 사건.
 * 동일 요청에서 size=20 으로 응답하면 20행이 INSERT 된다.
 *
 * - request_id: 동일 요청 묶음 식별자 (UUID, NDCG@10 계산의 핵심)
 * - position: 응답 내 순위 (1..size)
 * - user_id: nullable (비로그인 노출도 적재해 CTR/CVR 분모를 정확히 잡기 위함)
 */
@Entity
@Table(name = "job_post_impression_logs",
        indexes = {
                @Index(name = "idx_imp_request",  columnList = "request_id"),
                @Index(name = "idx_imp_user_at",  columnList = "user_id, at"),
                @Index(name = "idx_imp_post_at",  columnList = "post_id, at"),
                @Index(name = "idx_imp_at",       columnList = "at")
        })
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobPostImpressionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "position", nullable = false)
    private Integer position;

    @Column(name = "sort_type", length = 20)
    private String sortType;

    @Column(name = "request_id", length = 36, nullable = false)
    private String requestId;

    @Column(name = "at", nullable = false)
    private LocalDateTime at;
}
