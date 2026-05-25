package com.itda.service.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * 자정(00:00)을 넘는 시간대를 날짜 단위 Slice 로 분할하는 순수 유틸.
 *
 * <p><b>설계 원칙:</b>
 * <ul>
 *   <li>도메인 Entity 에 일절 의존하지 않아 JobPost·WorkerAvailability 양쪽에서 재사용 가능.</li>
 *   <li>분할 결과인 {@link Slice} 는 Entity 빌더에 그대로 꽂아 쓸 수 있는 raw 값 집합이다.</li>
 *   <li>과거 시점 검증(startAt &lt; now)은 호출자 책임이며, 이 클래스는 순수 분할만 담당한다.</li>
 * </ul>
 *
 * <p><b>분할 규칙 요약:</b>
 * <ol>
 *   <li>같은 날짜 내에서 끝나는 경우 → Slice 1개.</li>
 *   <li>endAt 이 자정 정각(다음날 00:00)인 경우 → Slice 1개,
 *       {@code endTime = LocalTime.MAX}로 저장, {@code groupEndAt = 다음날 00:00}.</li>
 *   <li>자정을 넘기는 경우(다음날 00:00 초과) → Slice 2개:
 *       첫째 날 {@code endTime = LocalTime.MAX}, 둘째 날 {@code startTime = LocalTime.MIN}.</li>
 *   <li>24시간 이상(≥ 1440분)은 V1 범위 밖으로 거부.</li>
 * </ol>
 */
public final class TimeSlotSplitter {

    private TimeSlotSplitter() {
        // 유틸 클래스 — 인스턴스 생성 금지
    }

    // ─── 결과 타입 ───────────────────────────────────────────────────

    /**
     * 분할된 단일 날짜 조각.
     * <p>{@code date} + {@code startTime} + {@code endTime} 을 Entity 빌더에 직접 사용한다.
     * 자정에 걸쳐 끝나는 조각(첫째 날)의 {@code endTime} 은 {@link LocalTime#MAX}로 저장된다.
     */
    public record Slice(
            LocalDate date,
            LocalTime startTime,
            LocalTime endTime
    ) {}

    /**
     * {@link #split} 전체 결과.
     *
     * <ul>
     *   <li>{@code linkedGroupId}: 동일 그룹임을 나타내는 UUID 문자열(36자).
     *       분할 안 된 단일 Slice 도 같은 ID 를 갖는다.</li>
     *   <li>{@code groupStartAt} / {@code groupEndAt}: 비정규화된 그룹 전체 datetime.
     *       매칭 쿼리에서 단일 범위 비교({@code groupStartAt ≤ post.start AND groupEndAt ≥ post.end})에 사용.</li>
     *   <li>{@code slices}: 1개(분할 없음) 또는 2개(자정 넘김).</li>
     * </ul>
     */
    public record Split(
            String linkedGroupId,
            LocalDateTime groupStartAt,
            LocalDateTime groupEndAt,
            List<Slice> slices
    ) {}

    // ─── 핵심 로직 ───────────────────────────────────────────────────

    /**
     * {@code startAt}과 {@code endAt} 을 받아 1~2개 {@link Slice} 로 분할한다.
     *
     * <p><b>케이스별 동작:</b>
     * <ul>
     *   <li><b>같은 날 종료</b>: Slice 1개, endTime = endAt.toLocalTime()</li>
     *   <li><b>자정 정각 종료</b>(endAt.toLocalTime() == 00:00): Slice 1개,
     *       endTime = {@link LocalTime#MAX}</li>
     *   <li><b>자정 초과 종료</b>: Slice 2개, 첫째 날 endTime = MAX, 둘째 날 startTime = MIN</li>
     * </ul>
     *
     * @param startAt 시작 일시
     * @param endAt   종료 일시
     * @return 분할 결과 {@link Split}
     * @throws IllegalArgumentException endAt ≤ startAt 이거나 지속 시간이 24시간 이상인 경우
     */
    public static Split split(LocalDateTime startAt, LocalDateTime endAt) {
        validate(startAt, endAt);

        LocalDate startDate = startAt.toLocalDate();
        LocalDate endDate   = endAt.toLocalDate();
        LocalTime startTime = startAt.toLocalTime();
        LocalTime endTime   = endAt.toLocalTime();

        String groupId = UUID.randomUUID().toString();
        List<Slice> slices = new ArrayList<>();

        if (startDate.equals(endDate)) {
            // 케이스 1: 같은 날 — 단일 Slice
            slices.add(new Slice(startDate, startTime, endTime));

        } else if (endTime.equals(LocalTime.MIDNIGHT)) {
            // 케이스 2: 자정 정각 종료 (예: 22:00 → 다음날 00:00)
            // → endTime = LocalTime.MAX 로 단일 Slice 저장 (자정을 "그날 끝"으로 표현)
            slices.add(new Slice(startDate, startTime, LocalTime.MAX));

        } else {
            // 케이스 3: 자정을 실제로 넘어 다음날 시간까지 이어지는 경우
            // → 첫째 날: startTime ~ LocalTime.MAX, 둘째 날: LocalTime.MIN ~ endTime
            slices.add(new Slice(startDate, startTime, LocalTime.MAX));
            slices.add(new Slice(endDate,   LocalTime.MIN, endTime));
        }

        return new Split(groupId, startAt, endAt, Collections.unmodifiableList(slices));
    }

    // ─── 내부 검증 ───────────────────────────────────────────────────

    private static void validate(LocalDateTime startAt, LocalDateTime endAt) {
        if (startAt == null || endAt == null) {
            throw new IllegalArgumentException("startAt 과 endAt 은 null 일 수 없습니다.");
        }
        if (!endAt.isAfter(startAt)) {
            throw new IllegalArgumentException(
                    "endAt 은 startAt 보다 이후여야 합니다. startAt=" + startAt + ", endAt=" + endAt);
        }
        long durationMinutes = ChronoUnit.MINUTES.between(startAt, endAt);
        // V1 정책: 24시간(1440분) 이상은 다중 일자로 간주하여 거부
        if (durationMinutes >= 1440) {
            throw new IllegalArgumentException(
                    "지속 시간이 24시간 이상입니다(V1 범위 밖). durationMinutes=" + durationMinutes);
        }
    }
}
