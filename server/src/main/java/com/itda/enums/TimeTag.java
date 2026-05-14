package com.itda.enums;

import java.time.LocalTime;
import java.util.List;

/**
 * 공고 필터의 "근무 시간대 태그" enum.
 *
 * 각 태그는 (start, end) 범위를 가지며, end 가 start 보다 빠른 경우엔
 * 자정을 넘기는 야간 구간으로 해석합니다. 자정을 넘기는 태그(저녁~새벽 등)는
 * {@link #toRanges()}에서 두 개의 일반 구간으로 분해합니다.
 *
 * 사양:
 *   MORNING            오전          06:00 ~ 12:00
 *   MORNING_AFTERNOON  오전 ~ 오후    06:00 ~ 18:00
 *   AFTERNOON          오후          12:00 ~ 18:00
 *   AFTERNOON_EVENING  오후 ~ 저녁    12:00 ~ 24:00
 *   EVENING            저녁          18:00 ~ 23:00
 *   EVENING_DAWN       저녁 ~ 새벽    18:00 ~ 06:00 (자정 넘김)
 *   DAWN               새벽          00:00 ~ 06:00
 *   DAWN_MORNING       새벽 ~ 오전    00:00 ~ 12:00
 *
 * 참고) LocalTime은 23:59:59.999... 까지만 표현 가능하므로 24:00은 LocalTime.MAX로 매핑합니다.
 */
public enum TimeTag {
    MORNING(LocalTime.of(6, 0), LocalTime.of(12, 0)),
    MORNING_AFTERNOON(LocalTime.of(6, 0), LocalTime.of(18, 0)),
    AFTERNOON(LocalTime.of(12, 0), LocalTime.of(18, 0)),
    AFTERNOON_EVENING(LocalTime.of(12, 0), LocalTime.MAX),
    EVENING(LocalTime.of(18, 0), LocalTime.of(23, 0)),
    EVENING_DAWN(LocalTime.of(18, 0), LocalTime.of(6, 0)),
    DAWN(LocalTime.MIN, LocalTime.of(6, 0)),
    DAWN_MORNING(LocalTime.MIN, LocalTime.of(12, 0));

    private final LocalTime start;
    private final LocalTime end;

    TimeTag(LocalTime start, LocalTime end) {
        this.start = start;
        this.end = end;
    }

    public LocalTime getStart() {
        return start;
    }

    public LocalTime getEnd() {
        return end;
    }

    /**
     * 태그를 1개 또는 2개의 일반 구간으로 펼친다.
     * 자정을 넘기는 태그는 [start, 24:00) ∪ [00:00, end) 두 구간으로 분해.
     */
    public List<Range> toRanges() {
        if (!end.isBefore(start)) {
            return List.of(new Range(start, end));
        }
        return List.of(
                new Range(start, LocalTime.MAX),
                new Range(LocalTime.MIN, end)
        );
    }

    public record Range(LocalTime start, LocalTime end) {}
}
