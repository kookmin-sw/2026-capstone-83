package com.itda.dto.response;

import java.time.LocalDate;

/**
 * 어드민 대시보드 일별 추이 응답.
 *
 * - ctr               : 전체 노출 대비 클릭률
 * - cvrByImpression   : 전체 노출 대비 지원 전환율 (넓은 funnel)
 * - cvrByClick        : 클릭 대비 지원 전환율 (좁은 funnel)
 * - ndcgAt10          : RECOMMENDED 정렬 결과 한정 평균 NDCG@10
 */
public record DailyMetricsResponse(
        LocalDate date,
        long impressions,
        long clicks,
        long applications,
        Double ctr,
        Double cvrByImpression,
        Double cvrByClick,
        Double ndcgAt10
) {}
