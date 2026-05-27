package com.itda.service.event;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 자동 매칭 이벤트 모델.
 *
 * <ul>
 *   <li>{@link AvailabilityCreatedEvent}: 구직자 가용시간 등록/수정 완료 후 발행.
 *       가용시간 범위에 포함되는 OPEN 공고를 찾아 자동 매칭을 시도한다.</li>
 *   <li>{@link JobPostCreatedEvent}: 구인 공고 등록 완료 후 발행.
 *       공고 범위를 포함하는 가용시간을 가진 구직자를 찾아 자동 매칭을 시도한다.</li>
 * </ul>
 *
 * <p>두 이벤트 모두 {@code eventsExecutor} 스레드 풀에서 비동기 처리되므로
 * 사용자 요청 레이턴시에 영향을 주지 않는다.
 */
public final class AutoMatchEvents {

    private AutoMatchEvents() {}

    /**
     * 구직자 가용시간 생성/수정 이벤트.
     *
     * @param userId             가용시간을 등록한 구직자 User ID
     * @param availabilityId     단일 가용시간 레코드 ID
     * @param availStartAt       가용시간 시작 일시
     * @param availEndAt         가용시간 종료 일시
     * @param minDurationMinutes 구직자가 요구하는 최소 근무 시간(분)
     * @param preferredDistricts 구직자 희망 근무 지역 목록 (시/구 단위)
     */
    public record AvailabilityCreatedEvent(
            Long userId,
            Long availabilityId,
            LocalDateTime availStartAt,
            LocalDateTime availEndAt,
            int minDurationMinutes,
            List<String> preferredDistricts
    ) {}

    /**
     * 구인 공고 등록 이벤트.
     *
     * @param jobPostId        JobPost DB PK
     * @param workStartAt      공고 근무 시작 일시 (매칭 전용)
     * @param workEndAt        공고 근무 종료 일시 (매칭 전용, 항상 workStartAt 보다 큼)
     * @param employerUserId   공고 등록 고용주의 User ID
     * @param workplaceDistrict 공고 사업장 행정구역 (시/구 단위)
     */
    public record JobPostCreatedEvent(
            Long jobPostId,
            LocalDateTime workStartAt,
            LocalDateTime workEndAt,
            Long employerUserId,
            String workplaceDistrict
    ) {}
}
