package com.itda.controller;

import com.itda.dto.response.DailyMetricsResponse;
import com.itda.dto.response.MetricsSummaryResponse;
import com.itda.service.ManagerMetricsService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 매니저 대시보드 — 추천 funnel 지표(CTR / CVR / NDCG@10) 조회.
 *
 * SecurityConfig 에서 `/api/v1/manager/**` 전체가 ROLE_MANAGER 로 제한되므로
 * 이 컨트롤러 자체 권한 검증은 생략 (선언적 보안만 의존).
 */
@RestController
@RequestMapping("/api/v1/manager/metrics")
@RequiredArgsConstructor
public class ManagerMetricsController {

    private final ManagerMetricsService managerMetricsService;

    /**
     * 일별 추이 — 차트용.
     * GET /api/v1/manager/metrics/recommendation/daily?from=2026-04-01&to=2026-05-01
     */
    @GetMapping("/recommendation/daily")
    public ResponseEntity<List<DailyMetricsResponse>> daily(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(managerMetricsService.daily(from, to));
    }

    /**
     * 기간 요약 — KPI 카드용.
     * GET /api/v1/manager/metrics/recommendation/summary?days=30
     */
    @GetMapping("/recommendation/summary")
    public ResponseEntity<MetricsSummaryResponse> summary(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(managerMetricsService.summary(days));
    }
}
