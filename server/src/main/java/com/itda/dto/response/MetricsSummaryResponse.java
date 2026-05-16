package com.itda.dto.response;

/**
 * 어드민 대시보드 KPI 카드 응답.
 * 지정한 기간(default 30일) 동안의 전체 합계와 평균 지표.
 */
public record MetricsSummaryResponse(
        int periodDays,
        long impressions,
        long clicks,
        long applications,
        Double ctr,
        Double cvrByImpression,
        Double cvrByClick,
        Double ndcgAt10
) {}
