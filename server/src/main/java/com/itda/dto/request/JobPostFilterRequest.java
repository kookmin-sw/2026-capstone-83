package com.itda.dto.request;

import com.itda.enums.TimeTag;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * 공고 목록 조회 필터 + 페이지네이션 요청 DTO
 *
 * 메인/공고 목록 화면 태그 필터(업종/위치/요일/시간대/필수조건/우대조건)와
 * 키워드 검색, 정렬, 커서 페이지네이션을 한 DTO에 모두 담는다.
 *
 * 컨트롤러는 @ModelAttribute 로 바인딩하며, 다중 선택 필드는
 *   ?jobCategories=HOTEL&jobCategories=LOGISTICS
 * 와 같이 같은 키를 반복해서 전달한다.
 *
 * 기존 단일 값 필드(jobCategory, location, workDate, jobSubcategory)는
 * 하위 호환을 위해 유지하며, 다중 필드가 비어 있을 때만 보조 fallback으로 사용한다.
 */
public record JobPostFilterRequest(

        // ─── 페이지네이션 ─────────────────────────────────
        Long cursor,
        Integer size,

        // ─── 검색 ────────────────────────────────────────
        String keyword,

        // ─── 1. 업종 (다중) ───────────────────────────────
        List<String> jobCategories,

        // ─── 2. 위치 (다중, 주소 LIKE OR 매칭) ─────────────
        List<String> locations,

        // ─── 3. 근무 일자 (범위) ──────────────────────────
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDateFrom,
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate workDateTo,

        // ─── 4. 선호 요일 (다중) — MON, TUE, ..., SUN ──────
        List<String> weekdays,

        // ─── 5. 근무 시간 (범위) ──────────────────────────
        @DateTimeFormat(pattern = "HH:mm") LocalTime timeFrom,
        @DateTimeFormat(pattern = "HH:mm") LocalTime timeTo,

        // ─── 6. 근무 시간대 태그 (다중) ───────────────────
        List<TimeTag> timeTags,

        // ─── 7-1. 연령/성별/학력 필수 조건 (다중) ──────────
        List<String> ageRequirements,

        // ─── 7-2. 자격/인증 필수 조건 (다중) ──────────────
        // 엔티티의 requirements(JSON List<String>) 컬럼과 매칭
        List<String> certRequirements,

        // ─── 8-1. 최소 급여 ──────────────────────────────
        Integer minWage,

        // ─── 8-2. 우대 조건 (다중) ───────────────────────
        // 엔티티의 benefits(JSON List<String>) 컬럼과 매칭
        List<String> benefits,

        // ─── 정렬 ────────────────────────────────────────
        // WAGE: 급여 내림차순 / WORK_DATE: 근무일 오름차순 / DEADLINE: 마감 임박순
        // 그 외: 최신순(id desc)
        String sortType,

        // ─── 하위 호환용 단일 값 필드 (legacy) ────────────
        String jobCategory,
        String jobSubcategory,
        String location,
        String workDate
) {
    // size 기본값 10
    public int getSize() {
        return size != null ? size : 10;
    }

    /** 다중 jobCategories 가 비면 단일 jobCategory 로 fallback. */
    public List<String> effectiveJobCategories() {
        if (jobCategories != null && !jobCategories.isEmpty()) return jobCategories;
        if (jobCategory != null && !jobCategory.isBlank()) return List.of(jobCategory);
        return List.of();
    }

    /** 다중 locations 가 비면 단일 location 으로 fallback. */
    public List<String> effectiveLocations() {
        if (locations != null && !locations.isEmpty()) return locations;
        if (location != null && !location.isBlank()) return List.of(location);
        return List.of();
    }

    /** 다중 workDateFrom/To 가 비면 단일 workDate 로 fallback (해당 날짜 하루로). */
    public LocalDate effectiveWorkDateFrom() {
        if (workDateFrom != null) return workDateFrom;
        if (workDate != null && !workDate.isBlank()) return LocalDate.parse(workDate);
        return null;
    }

    public LocalDate effectiveWorkDateTo() {
        if (workDateTo != null) return workDateTo;
        if (workDate != null && !workDate.isBlank()) return LocalDate.parse(workDate);
        return null;
    }
}
