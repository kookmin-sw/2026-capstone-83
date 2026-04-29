package com.itda.dto.request;

/**
 * 공고 목록 조회 필터 + 페이지네이션 요청 DTO
 * 지역, 업종, 키워드, 정렬 등 모든 필터를 하나의 객체로 처리
 */
public record JobPostFilterRequest(

        // 커서 방식 페이지네이션 - 마지막으로 받은 공고 ID
        Long cursor,

        // 한 번에 가져올 개수 (기본값 10)
        Integer size,

        // 검색어 (공고 제목 검색)
        String keyword,

        // 업종 대분류 필터 (건설·건축 / 물류·운송 등)
        String jobCategory,

        // 업종 소분류 필터
        String jobSubcategory,

        // 지역 필터 (주소 포함 검색)
        String location,

        // 근무 날짜 필터 (yyyy-MM-dd)
        String workDate,

        // 정렬 기준 (WAGE: 급여순 / DEADLINE: 마감임박순 / LATEST: 최신순)
        String sortType
) {
    // size 기본값 10
    public int getSize() {
        return size != null ? size : 10;
    }
}