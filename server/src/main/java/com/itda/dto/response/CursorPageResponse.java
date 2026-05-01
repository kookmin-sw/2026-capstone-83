package com.itda.dto.response;

import java.util.List;

/**
 * 커서 방식 페이지네이션 공통 응답 DTO
 * 공고 목록 등 무한스크롤이 필요한 API에서 공통으로 사용
 */
public record CursorPageResponse<T>(

        // 조회된 공고 목록
        List<T> jobPosts,

        // 다음 요청에 사용할 커서 ID (마지막 페이지면 null)
        Long nextCursor,

        // 다음 페이지 존재 여부
        boolean hasNext
) {
    public static <T> CursorPageResponse<T> of(List<T> jobPosts, Long nextCursor, boolean hasNext) {
        return new CursorPageResponse<>(jobPosts, nextCursor, hasNext);
    }
}