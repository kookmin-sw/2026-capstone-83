package com.itda.dto.response;

import com.itda.entity.WorkerAvailability;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * 구직자 가용시간 조회 응답 DTO.
 *
 * <p>1~2개 레코드로 구성된 <b>그룹 단위</b>로 표현한다.
 * 자정 분할된 Day1·Day2 를 프론트에 그대로 노출하면 캘린더에서 같은 슬롯이
 * 두 블록으로 보이는 문제가 생기므로, 항상 그룹을 하나의 DTO 로 묶어 내린다.
 *
 * <ul>
 *   <li>{@code linkedGroupId}: 클라이언트가 슬롯을 식별하는 키.
 *       수정·삭제 요청 시 그룹 내 아무 레코드 ID 를 사용하면 됨.</li>
 *   <li>{@code startAt}/{@code endAt}: 그룹 전체 datetime({@code groupStartAt}/{@code groupEndAt}).</li>
 *   <li>{@code crossesMidnight}: 프론트가 두 날짜 블록으로 렌더링할지 판단용.</li>
 * </ul>
 */
public record WorkerAvailabilityResponse(
        String linkedGroupId,
        LocalDateTime startAt,     // groupStartAt
        LocalDateTime endAt,       // groupEndAt
        int minDurationMinutes,
        boolean crossesMidnight,   // true 이면 Day1·Day2 두 레코드로 분할된 슬롯
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    /**
     * 같은 {@code linkedGroupId} 를 가진 1~2개 레코드 목록으로부터 DTO 를 조립한다.
     *
     * <p>레코드 정렬은 내부에서 {@code date asc → startTime asc} 로 보장하므로
     * 호출자는 정렬 순서를 신경 쓰지 않아도 된다.
     *
     * @param groupRecords 같은 linkedGroupId 의 레코드 1~2개
     * @throws IllegalArgumentException groupRecords 가 비어 있는 경우
     */
    public static WorkerAvailabilityResponse fromGroup(List<WorkerAvailability> groupRecords) {
        if (groupRecords == null || groupRecords.isEmpty()) {
            throw new IllegalArgumentException("그룹 레코드가 비어 있습니다.");
        }

        // date asc → startTime asc 정렬 보장 (Day1 = index 0)
        List<WorkerAvailability> sorted = groupRecords.stream()
                .sorted(Comparator.comparing(WorkerAvailability::getDate)
                        .thenComparing(WorkerAvailability::getStartTime))
                .toList();

        WorkerAvailability representative = sorted.get(0);
        boolean crossesMidnight = sorted.size() == 2;

        return new WorkerAvailabilityResponse(
                representative.getLinkedGroupId(),
                representative.getGroupStartAt(),
                representative.getGroupEndAt(),
                representative.getMinDurationMinutes(),
                crossesMidnight,
                representative.getCreatedAt(),
                representative.getUpdatedAt()
        );
    }
}
