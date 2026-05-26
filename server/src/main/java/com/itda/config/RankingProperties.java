package com.itda.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

/**
 * 공고 추천(RECOMMENDED) 랭킹의 점수 가중치 외부 설정.
 *
 * application.yml 의 `ranking.weights` 블록에서 값을 받아오며, 환경별
 * (application-dev.yml / application-prod.yml) 오버라이드와 환경변수
 * (RANKING_WEIGHTS_CATEGORY_MATCH 등) 덮어쓰기를 그대로 지원한다.
 *
 * 모든 값은 0 이상 정수. 응용 로직(JobPostRankingService)에서 각 시그널
 * 함수가 누적하는 정수 점수에 그대로 곱해진다.
 *
 * 기본값은 본 프로젝트의 랭킹 표 (지역 30 / 카테고리 20 / 일정 15 /
 * 급여 15 / 신선도 10 / 급구 8 / 좋아요 사업장 5 / HIRED 사업장 5 / APPLIED·PENDING -10).
 */
@ConfigurationProperties(prefix = "ranking.weights")
@Validated
public record RankingProperties(

        /** 지역 일치 단계별 가중치 — 도/시 일치 = 1단계, 시군구 = 2단계, 동 = 3단계. 최대 점수 = 3 * locationPerLevel */
        @Min(0) int locationPerLevel,

        /** 업종 카테고리(최빈) 일치 시 가산 */
        @Min(0) int categoryMatch,

        /** 같은 날짜 HIRED 일정과 충돌하지 않을 때 가산 */
        @Min(0) int scheduleAvailable,

        /** 급여 백분위 등급 가중치. 상위 25%/50~75%/25~50% 3등급 */
        @Valid @NotNull WageTier wageTier,

        /** 마감 7일 이내 또는 등록 24시간 이내 가산 */
        @Min(0) int freshness,

        /** 급구(urgentEnabled = true) 공고 가산 — 빠른 채용이 필요한 공고를 상위 노출 */
        @Min(0) int urgent,

        /** 사용자가 좋아요한 공고의 employer / 사용자 이력서를 좋아요한 employer 가산 */
        @Min(0) int likedEmployer,

        /** 과거 HIRED 된 사업장의 employer 가산 (재고용 가능성) */
        @Min(0) int hiredEmployer,

        /** APPLIED 또는 PENDING 상태 공고에 대한 감점 (양수로 적되 점수에서 빼짐) */
        @Min(0) int appliedPenalty
) {

    /** 급여 백분위 3등급. top25 ≥ mid5075 ≥ mid2550 ≥ 0 가정 (코드에서 가산만 함). */
    public record WageTier(
            @Min(0) int top25,
            @Min(0) int mid5075,
            @Min(0) int mid2550
    ) {}
}
