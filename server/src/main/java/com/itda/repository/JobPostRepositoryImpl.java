package com.itda.repository;

import com.itda.dto.request.JobPostFilterRequest;
import com.itda.entity.JobPost;
import com.itda.enums.JobPostStatus;
import com.itda.enums.TimeTag;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 공고 동적 필터 조회 구현체.
 *
 * 필터 종류가 많고 조합이 동적이므로 JPQL StringBuilder + 파라미터 맵으로 빌드한다.
 * Hibernate JPQL의 FUNCTION('NAME', ...) 으로 MySQL 함수(DAYOFWEEK, JSON_CONTAINS)를
 * 그대로 호출한다 — 운영 DB가 MySQL 인 것에 의존한다(application.yml MySQL8Dialect).
 *
 * 정책:
 *   - status = OPEN 인 공고만 노출
 *   - cursor 가 있으면 id < :cursor 조건 추가, 최신순 정렬일 때 자연스럽게 동작
 *   - 다중 태그(jobCategories/locations/weekdays/timeTags/ageRequirements/...)는
 *     필드 내부에서 OR, 필드 간에는 AND
 *   - locations 는 시·도 명을 주소에 포함하는 LIKE OR 매칭
 *   - weekdays 는 MySQL DAYOFWEEK(workDate) 와 매핑 (SUN=1..SAT=7)
 *   - timeTags 는 자정 넘는 구간을 두 구간으로 분해한 뒤 모두 OR overlap 검사
 *   - ageRequirements/certRequirements/benefits 는 JSON_CONTAINS 로 매칭
 */
@RequiredArgsConstructor
public class JobPostRepositoryImpl implements JobPostRepositoryCustom {

    private final EntityManager em;

    @Override
    public List<JobPost> findByDynamicFilter(JobPostFilterRequest req, int fetchSize) {
        StringBuilder jpql = new StringBuilder(
                "SELECT j FROM JobPost j WHERE j.status = :status"
        );
        Map<String, Object> params = new HashMap<>();
        params.put("status", JobPostStatus.OPEN);

        // ─── 커서 ─────────────────────────────────────────
        if (req.cursor() != null) {
            jpql.append(" AND j.id < :cursor");
            params.put("cursor", req.cursor());
        }

        // ─── 키워드 ───────────────────────────────────────
        if (req.keyword() != null && !req.keyword().isBlank()) {
            jpql.append(" AND j.title LIKE :keyword");
            params.put("keyword", "%" + req.keyword().trim() + "%");
        }

        // ─── 1. 업종 ──────────────────────────────────────
        List<String> jobCategories = req.effectiveJobCategories();
        if (!jobCategories.isEmpty()) {
            jpql.append(" AND j.jobCategory IN :jobCategories");
            params.put("jobCategories", jobCategories);
        }
        // 하위 호환: jobSubcategory 단일 값
        if (req.jobSubcategory() != null && !req.jobSubcategory().isBlank()) {
            jpql.append(" AND j.jobSubcategory = :jobSubcategory");
            params.put("jobSubcategory", req.jobSubcategory());
        }

        // ─── 2. 위치 (LIKE OR) ───────────────────────────
        List<String> locations = req.effectiveLocations();
        if (!locations.isEmpty()) {
            jpql.append(" AND (");
            for (int i = 0; i < locations.size(); i++) {
                if (i > 0) jpql.append(" OR ");
                String key = "loc" + i;
                jpql.append("j.workplace.address LIKE :").append(key);
                params.put(key, "%" + locations.get(i) + "%");
            }
            jpql.append(")");
        }

        // ─── 3. 근무 일자 범위 ────────────────────────────
        LocalDate workDateFrom = req.effectiveWorkDateFrom();
        LocalDate workDateTo = req.effectiveWorkDateTo();
        if (workDateFrom != null) {
            jpql.append(" AND j.workDate >= :workDateFrom");
            params.put("workDateFrom", workDateFrom);
        }
        if (workDateTo != null) {
            jpql.append(" AND j.workDate <= :workDateTo");
            params.put("workDateTo", workDateTo);
        }

        // ─── 4. 선호 요일 ─────────────────────────────────
        if (req.weekdays() != null && !req.weekdays().isEmpty()) {
            List<Integer> mysqlDays = req.weekdays().stream()
                    .map(JobPostRepositoryImpl::toMysqlDayOfWeek)
                    .toList();
            jpql.append(" AND FUNCTION('DAYOFWEEK', j.workDate) IN :weekdayInts");
            params.put("weekdayInts", mysqlDays);
        }

        // ─── 5. 근무 시간 범위 (overlap) ──────────────────
        // 공고 시간 [workStart, workEnd] 와 요청 시간 [timeFrom, timeTo] 의 overlap:
        //   workStart < timeTo AND workEnd > timeFrom
        if (req.timeFrom() != null) {
            jpql.append(" AND j.workEnd > :timeFrom");
            params.put("timeFrom", req.timeFrom());
        }
        if (req.timeTo() != null) {
            jpql.append(" AND j.workStart < :timeTo");
            params.put("timeTo", req.timeTo());
        }

        // ─── 6. 근무 시간대 태그 ──────────────────────────
        if (req.timeTags() != null && !req.timeTags().isEmpty()) {
            List<TimeTag.Range> ranges = new ArrayList<>();
            for (TimeTag tag : req.timeTags()) {
                ranges.addAll(tag.toRanges());
            }
            jpql.append(" AND (");
            for (int i = 0; i < ranges.size(); i++) {
                if (i > 0) jpql.append(" OR ");
                String s = "tagS" + i;
                String e = "tagE" + i;
                jpql.append("(j.workStart < :").append(e)
                        .append(" AND j.workEnd > :").append(s).append(")");
                LocalTime rs = ranges.get(i).start();
                LocalTime re = ranges.get(i).end();
                params.put(s, rs);
                params.put(e, re);
            }
            jpql.append(")");
        }

        // ─── 7-1. 연령/성별/학력 필수 조건 ────────────────
        appendJsonContainsAny(jpql, params, "age", "j.ageRequirements", req.ageRequirements());

        // ─── 7-2. 자격/인증 필수 조건 (requirements 컬럼) ─
        appendJsonContainsAny(jpql, params, "cert", "j.requirements", req.certRequirements());

        // ─── 8-1. 최소 급여 ──────────────────────────────
        if (req.minWage() != null) {
            jpql.append(" AND j.wage >= :minWage");
            params.put("minWage", req.minWage());
        }

        // ─── 8-2. 우대 조건 (benefits 컬럼) ──────────────
        appendJsonContainsAny(jpql, params, "ben", "j.benefits", req.benefits());

        // ─── 정렬 ────────────────────────────────────────
        jpql.append(buildOrderBy(req.sortType()));

        TypedQuery<JobPost> query = em.createQuery(jpql.toString(), JobPost.class);
        params.forEach(query::setParameter);
        query.setMaxResults(fetchSize);
        return query.getResultList();
    }

    // ─── helpers ────────────────────────────────────────

    /**
     * JSON_CONTAINS(column, '"VALUE"') = 1 OR ... 절을 append.
     * 컬럼은 List<String>을 JSON 배열로 직렬화한 TEXT(예: ["A","B"]).
     */
    private static void appendJsonContainsAny(
            StringBuilder jpql,
            Map<String, Object> params,
            String paramPrefix,
            String columnPath,
            List<String> values) {

        if (values == null || values.isEmpty()) return;

        jpql.append(" AND (");
        for (int i = 0; i < values.size(); i++) {
            if (i > 0) jpql.append(" OR ");
            String key = paramPrefix + i;
            // FUNCTION 결과 비교는 정수 1
            jpql.append("FUNCTION('JSON_CONTAINS', ").append(columnPath)
                    .append(", :").append(key).append(") = 1");
            // JSON 스칼라 비교를 위해 큰따옴표로 한 번 더 감싸 전송
            params.put(key, "\"" + escapeJsonString(values.get(i)) + "\"");
        }
        jpql.append(")");
    }

    /** JSON 문자열 내부에 안전하게 들어가도록 큰따옴표/백슬래시를 이스케이프. */
    private static String escapeJsonString(String v) {
        return v.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String buildOrderBy(String sortType) {
        if ("WAGE".equals(sortType)) {
            return " ORDER BY j.wage DESC, j.id DESC";
        }
        if ("WORK_DATE".equals(sortType)) {
            return " ORDER BY j.workDate ASC, j.id DESC";
        }
        if ("DEADLINE".equals(sortType)) {
            return " ORDER BY j.deadline ASC, j.id DESC";
        }
        // LOCATION 정렬은 거리 정보 부재로 미지원 — 최신순으로 fallback
        return " ORDER BY j.id DESC";
    }

    /**
     * Java 요일 코드(MON, TUE, ...) → MySQL DAYOFWEEK 정수(SUN=1..SAT=7).
     */
    private static int toMysqlDayOfWeek(String day) {
        return switch (day.toUpperCase()) {
            case "SUN" -> 1;
            case "MON" -> 2;
            case "TUE" -> 3;
            case "WED" -> 4;
            case "THU" -> 5;
            case "FRI" -> 6;
            case "SAT" -> 7;
            default -> throw new IllegalArgumentException("Invalid weekday: " + day);
        };
    }
}
