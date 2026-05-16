package com.itda.service;

import com.itda.dto.response.DailyMetricsResponse;
import com.itda.dto.response.MetricsSummaryResponse;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 매니저 대시보드용 추천 funnel 지표 즉석 집계.
 *
 * MVP 단계라 매 요청마다 raw 로그를 SQL 로 집계한다 (배치 테이블 없음).
 * 트래픽이 늘어 SQL 비용이 부담되면 `daily_recommendation_metrics` 사전 집계 테이블 +
 * @Scheduled 일배치로 마이그레이션 (인터페이스 동일하게 유지).
 *
 * MySQL 함수(LOG2, ROW_NUMBER OVER, INTERVAL) 사용 — 운영 DB가 MySQL 8 인 것에 의존.
 *
 * 시간 윈도우 정책:
 *   - 클릭은 impression 후 24시간 이내까지 같은 (user, post) 매칭
 *   - 지원은 7일 이내까지 매칭
 *   - 비로그인 사용자(user_id IS NULL) 는 user 별 매칭 불가하므로 NDCG 에서만 제외
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ManagerMetricsService {

    private final EntityManager em;

    /** 일별 추이 (from..to). 비어 있는 날짜는 결과에서 제외. */
    public List<DailyMetricsResponse> daily(LocalDate from, LocalDate to) {
        // 1) 노출/클릭/지원 카운트를 날짜별로 한 번에 집계
        List<Object[]> base = em.createNativeQuery("""
                SELECT
                    d.day,
                    COALESCE(imp.cnt, 0)  AS impressions,
                    COALESCE(clk.cnt, 0)  AS clicks,
                    COALESCE(app.cnt, 0)  AS applications
                FROM (
                    -- 기간 내 날짜 시리즈를 imp/clk/app 합집합으로 도출
                    SELECT DISTINCT DATE(at) AS day FROM job_post_impression_logs
                        WHERE at >= :from AND at < :toExclusive
                    UNION
                    SELECT DISTINCT DATE(at) FROM job_post_click_logs
                        WHERE at >= :from AND at < :toExclusive
                    UNION
                    SELECT DISTINCT DATE(applied_at) FROM applications
                        WHERE applied_at >= :from AND applied_at < :toExclusive
                ) d
                LEFT JOIN (
                    SELECT DATE(at) day, COUNT(*) cnt FROM job_post_impression_logs
                    WHERE at >= :from AND at < :toExclusive
                    GROUP BY DATE(at)
                ) imp ON imp.day = d.day
                LEFT JOIN (
                    SELECT DATE(at) day, COUNT(*) cnt FROM job_post_click_logs
                    WHERE at >= :from AND at < :toExclusive
                    GROUP BY DATE(at)
                ) clk ON clk.day = d.day
                LEFT JOIN (
                    SELECT DATE(applied_at) day, COUNT(*) cnt FROM applications
                    WHERE applied_at >= :from AND applied_at < :toExclusive
                    GROUP BY DATE(applied_at)
                ) app ON app.day = d.day
                ORDER BY d.day
                """)
                .setParameter("from", Date.valueOf(from))
                .setParameter("toExclusive", Date.valueOf(to.plusDays(1)))
                .getResultList();

        // 2) NDCG 는 별도 쿼리로 일별 계산 (윈도우 함수 사용)
        List<Object[]> ndcgRows = em.createNativeQuery(ndcgDailySql())
                .setParameter("from", Date.valueOf(from))
                .setParameter("toExclusive", Date.valueOf(to.plusDays(1)))
                .getResultList();

        java.util.Map<LocalDate, Double> ndcgByDay = new java.util.HashMap<>();
        for (Object[] row : ndcgRows) {
            LocalDate day = ((Date) row[0]).toLocalDate();
            Double ndcg = row[1] != null ? ((Number) row[1]).doubleValue() : null;
            ndcgByDay.put(day, ndcg);
        }

        List<DailyMetricsResponse> result = new ArrayList<>(base.size());
        for (Object[] row : base) {
            LocalDate day = ((Date) row[0]).toLocalDate();
            long imp = ((Number) row[1]).longValue();
            long clk = ((Number) row[2]).longValue();
            long app = ((Number) row[3]).longValue();
            result.add(new DailyMetricsResponse(
                    day, imp, clk, app,
                    ratio(clk, imp),
                    ratio(app, imp),
                    ratio(app, clk),
                    ndcgByDay.get(day)
            ));
        }
        return result;
    }

    /** 지정 기간 (default 30일) 의 요약 KPI. */
    public MetricsSummaryResponse summary(int days) {
        LocalDate to = LocalDate.now();
        LocalDate from = to.minusDays(days - 1L);

        Object[] row = (Object[]) em.createNativeQuery("""
                SELECT
                    (SELECT COUNT(*) FROM job_post_impression_logs
                       WHERE at >= :from AND at < :toExclusive)            AS impressions,
                    (SELECT COUNT(*) FROM job_post_click_logs
                       WHERE at >= :from AND at < :toExclusive)            AS clicks,
                    (SELECT COUNT(*) FROM applications
                       WHERE applied_at >= :from AND applied_at < :toExclusive) AS applications
                """)
                .setParameter("from", Date.valueOf(from))
                .setParameter("toExclusive", Date.valueOf(to.plusDays(1)))
                .getSingleResult();

        long imp = ((Number) row[0]).longValue();
        long clk = ((Number) row[1]).longValue();
        long app = ((Number) row[2]).longValue();

        // 기간 전체 NDCG — daily ndcg 의 단순 평균이 아니라 raw 로 다시 계산해야
        // 요청 단위 가중치가 정확해진다. (요청 수가 많은 날 영향력 큼)
        Object ndcgObj = em.createNativeQuery(ndcgPeriodSql())
                .setParameter("from", Date.valueOf(from))
                .setParameter("toExclusive", Date.valueOf(to.plusDays(1)))
                .getSingleResult();
        Double ndcg = ndcgObj != null ? ((Number) ndcgObj).doubleValue() : null;

        return new MetricsSummaryResponse(
                days, imp, clk, app,
                ratio(clk, imp),
                ratio(app, imp),
                ratio(app, clk),
                ndcg
        );
    }

    // ─── NDCG SQL ───────────────────────────────────────

    /**
     * NDCG 계산 공통 CTE.
     * RECOMMENDED 정렬의 상위 10 노출만 대상으로, (user, post) 24h 클릭 / 7d 지원 / 24h 좋아요 와 조인해
     * 관련성 점수 r = 3(지원) / 2(좋아요) / 1(클릭) / 0(노출만) 을 매긴다.
     */
    private static final String NDCG_BASE_CTE = """
            WITH rel AS (
                SELECT
                    DATE(i.at) AS day,
                    i.request_id,
                    i.position,
                    CASE
                        WHEN a.id IS NOT NULL THEN 3
                        WHEN l.id IS NOT NULL THEN 2
                        WHEN c.id IS NOT NULL THEN 1
                        ELSE 0
                    END AS r
                FROM job_post_impression_logs i
                LEFT JOIN job_post_click_logs c
                    ON c.user_id = i.user_id AND c.post_id = i.post_id
                    AND c.at BETWEEN i.at AND i.at + INTERVAL 24 HOUR
                LEFT JOIN job_post_likes l
                    ON l.user_id = i.user_id AND l.job_post_id = i.post_id
                    AND l.created_at BETWEEN i.at AND i.at + INTERVAL 24 HOUR
                LEFT JOIN applications a
                    ON a.applicant_user_id = i.user_id AND a.job_post_id = i.post_id
                    AND a.applied_at BETWEEN i.at AND i.at + INTERVAL 7 DAY
                WHERE i.position <= 10
                  AND i.sort_type = 'RECOMMENDED'
                  AND i.user_id IS NOT NULL
                  AND i.at >= :from AND i.at < :toExclusive
            ),
            dcg AS (
                SELECT day, request_id,
                       SUM(r / LOG2(position + 1)) AS dcg
                FROM rel
                GROUP BY day, request_id
            ),
            ideal_pos AS (
                SELECT day, request_id, r,
                       ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY r DESC) AS ideal_rank
                FROM rel
            ),
            idcg AS (
                SELECT day, request_id,
                       SUM(r / LOG2(ideal_rank + 1)) AS idcg
                FROM ideal_pos
                GROUP BY day, request_id
            ),
            per_request AS (
                SELECT d.day, d.request_id,
                       CASE WHEN i.idcg > 0 THEN d.dcg / i.idcg ELSE NULL END AS ndcg
                FROM dcg d
                JOIN idcg i ON i.request_id = d.request_id
            )
            """;

    /** 일별 NDCG 평균. SELECT day, ndcg. */
    private String ndcgDailySql() {
        return NDCG_BASE_CTE + """
                SELECT day, AVG(ndcg) FROM per_request
                WHERE ndcg IS NOT NULL
                GROUP BY day
                """;
    }

    /** 기간 전체 NDCG 평균 (요청 가중). */
    private String ndcgPeriodSql() {
        return NDCG_BASE_CTE + """
                SELECT AVG(ndcg) FROM per_request WHERE ndcg IS NOT NULL
                """;
    }

    // ─── helpers ────────────────────────────────────────

    private static Double ratio(long numerator, long denominator) {
        if (denominator == 0) return null;
        return (double) numerator / denominator;
    }
}
