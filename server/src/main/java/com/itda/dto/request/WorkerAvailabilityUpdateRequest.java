package com.itda.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

/**
 * 구직자 가용시간 수정 요청 DTO (전체 교체 방식).
 *
 * <p>부분 수정(null 필드 = 기존값 유지)이 아닌 전체 교체로 설계하였다.
 * 이유: 시간 변경이 자정 분할 여부 자체를 바꿀 수 있어 부분 수정 로직이 복잡해지고,
 * 사용자 모델("슬롯 하나를 통째로 옮기거나 늘린다")과도 더 가깝다.
 *
 * <p>내부적으로는 기존 그룹을 삭제하고 새 그룹으로 재생성한다.
 */
public record WorkerAvailabilityUpdateRequest(
        @NotNull(message = "시작 일시는 필수입니다.")
        LocalDateTime startAt,

        @NotNull(message = "종료 일시는 필수입니다.")
        LocalDateTime endAt,

        @Min(value = 0, message = "최소 근무 시간은 0 이상이어야 합니다.")
        Integer minDurationMinutes
) {
    /** null 방어 — null 이면 0(제한 없음) 반환. */
    public int getMinDurationMinutes() {
        return minDurationMinutes != null ? minDurationMinutes : 0;
    }
}
