package com.itda.service.event;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 공고 노출/클릭 이벤트 모델.
 *
 * - ImpressionBatchEvent : 한 응답에 포함된 공고들을 묶어 한 번에 발행 (N개)
 * - ClickEvent           : 상세 진입 한 건당 1회 발행
 *
 * Service 가 사용자 응답을 만든 직후 발행하고, 비동기 리스너가 별도 스레드에서
 * INSERT 처리한다 — 사용자 응답 latency 와 분리.
 */
public final class InteractionEvents {

    private InteractionEvents() {}

    /** 응답에 포함된 한 공고에 대한 노출 정보. */
    public record Impression(Long postId, int position) {}

    /** 한 응답에 포함된 노출들을 한 번에 묶은 이벤트. */
    public record ImpressionBatchEvent(
            String requestId,
            Long userId,                 // 비로그인이면 null
            String sortType,             // RECOMMENDED / WAGE / ...
            List<Impression> impressions,
            LocalDateTime at
    ) {}

    /** 공고 상세 진입 이벤트. */
    public record ClickEvent(
            String requestId,            // 클라이언트가 되돌려 보내준 값 (없으면 null)
            Long userId,                 // 비로그인이면 null
            Long postId,
            String referrerSortType,
            LocalDateTime at
    ) {}
}
