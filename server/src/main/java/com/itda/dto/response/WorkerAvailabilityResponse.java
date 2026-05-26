package com.itda.dto.response;

import com.itda.entity.WorkerAvailability;

import java.time.LocalDateTime;

/**
 * 구직자 가용시간 조회 응답 DTO.
 *
 * <p>단일 레코드를 그대로 DTO 로 변환한다.
 * 야간 슬롯(자정 넘김)도 한 DTO 에 표현되며, {@code crossesMidnight} 플래그로 프론트가
 * 두 날짜 블록으로 렌더링할지 결정할 수 있다.
 *
 * <ul>
 *   <li>{@code id}: 슬롯 고유 식별자. 수정·삭제 요청 시 이 값을 사용한다.</li>
 *   <li>{@code startAt}/{@code endAt}: 슬롯 전체 시작·종료 일시.</li>
 *   <li>{@code crossesMidnight}: endAt 날짜 &gt; startAt 날짜 이면 true.</li>
 * </ul>
 */
public record WorkerAvailabilityResponse(
        Long id,
        LocalDateTime startAt,
        LocalDateTime endAt,
        int minDurationMinutes,
        boolean crossesMidnight,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * 단일 {@link WorkerAvailability} 레코드로부터 DTO 를 생성한다.
     *
     * @param w 변환할 가용시간 엔티티
     */
    public static WorkerAvailabilityResponse from(WorkerAvailability w) {
        return new WorkerAvailabilityResponse(
                w.getId(),
                w.getAvailStartAt(),
                w.getAvailEndAt(),
                w.getMinDurationMinutes(),
                w.getAvailEndAt().toLocalDate().isAfter(w.getAvailStartAt().toLocalDate()),
                w.getCreatedAt(),
                w.getUpdatedAt()
        );
    }
}
