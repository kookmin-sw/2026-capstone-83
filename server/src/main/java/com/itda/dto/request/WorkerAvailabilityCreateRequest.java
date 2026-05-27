package com.itda.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 구직자 가용시간 등록 요청 DTO.
 *
 * <ul>
 *   <li>{@code startAt} / {@code endAt}: 그룹 전체 시작·종료 일시.
 *       자정을 넘기는 경우(endAt 의 날짜 &gt; startAt 의 날짜)는 서비스에서 자동 분할 저장된다.</li>
 *   <li>{@code minDurationMinutes}: null 이면 0(제한 없음)으로 처리.</li>
 *   <li>{@code preferredDistricts}: 희망 근무 지역 목록. 반드시 1개 이상 입력해야 한다.</li>
 * </ul>
 */
public record WorkerAvailabilityCreateRequest(
        @NotNull(message = "시작 일시는 필수입니다.")
        LocalDateTime startAt,

        @NotNull(message = "종료 일시는 필수입니다.")
        LocalDateTime endAt,

        @Min(value = 0, message = "최소 근무 시간은 0 이상이어야 합니다.")
        Integer minDurationMinutes,

        /** 희망 근무 지역 목록 (시/구 단위). 예: ["서울 강남구", "서울 마포구"]. 최소 1개 필수. */
        @NotEmpty(message = "희망 근무 지역을 최소 1개 이상 입력해주세요.")
        List<String> preferredDistricts
) {
    /** null 방어 — null 이면 0(제한 없음) 반환. */
    public int getMinDurationMinutes() {
        return minDurationMinutes != null ? minDurationMinutes : 0;
    }
}
