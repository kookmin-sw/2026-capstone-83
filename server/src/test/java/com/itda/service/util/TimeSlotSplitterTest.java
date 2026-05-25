package com.itda.service.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

class TimeSlotSplitterTest {

    // 테스트에 사용할 기준 날짜
    private static final LocalDate MON = LocalDate.of(2026, 5, 25); // 월요일
    private static final LocalDate TUE = MON.plusDays(1);

    // ─── 정상 케이스 ────────────────────────────────────────────────

    @Test
    @DisplayName("같은 날 단일 슬롯 (09:00–18:00) → Slice 1개, date/startTime/endTime 그대로")
    void sameDaySingleSlot() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(MON, LocalTime.of(18, 0));

        TimeSlotSplitter.Split result = TimeSlotSplitter.split(start, end);

        assertThat(result.slices()).hasSize(1);
        assertThat(result.groupStartAt()).isEqualTo(start);
        assertThat(result.groupEndAt()).isEqualTo(end);
        assertThat(result.linkedGroupId()).hasSize(36); // UUID 36자

        TimeSlotSplitter.Slice slice = result.slices().get(0);
        assertThat(slice.date()).isEqualTo(MON);
        assertThat(slice.startTime()).isEqualTo(LocalTime.of(9, 0));
        assertThat(slice.endTime()).isEqualTo(LocalTime.of(18, 0));
    }

    @Test
    @DisplayName("자정 정각 종료 (22:00–익일 00:00) → Slice 1개, endTime=LocalTime.MAX")
    void endsExactlyAtMidnight() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.of(22, 0));
        LocalDateTime end   = LocalDateTime.of(TUE, LocalTime.MIDNIGHT); // 익일 00:00

        TimeSlotSplitter.Split result = TimeSlotSplitter.split(start, end);

        // 자정 정각 종료 → 분할 없이 단일 Slice
        assertThat(result.slices()).hasSize(1);

        // groupEndAt 은 실제 입력값(익일 00:00) 그대로 보존
        assertThat(result.groupStartAt()).isEqualTo(start);
        assertThat(result.groupEndAt()).isEqualTo(end);

        TimeSlotSplitter.Slice slice = result.slices().get(0);
        assertThat(slice.date()).isEqualTo(MON);
        assertThat(slice.startTime()).isEqualTo(LocalTime.of(22, 0));
        // endTime 은 LocalTime.MAX 로 저장 (자정 표현)
        assertThat(slice.endTime()).isEqualTo(LocalTime.MAX);
    }

    @Test
    @DisplayName("자정 넘김 (22:00–익일 06:00) → Slice 2개")
    void crossesMidnight() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.of(22, 0));
        LocalDateTime end   = LocalDateTime.of(TUE, LocalTime.of(6, 0));

        TimeSlotSplitter.Split result = TimeSlotSplitter.split(start, end);

        assertThat(result.slices()).hasSize(2);
        assertThat(result.groupStartAt()).isEqualTo(start);
        assertThat(result.groupEndAt()).isEqualTo(end);

        // 첫째 날: 22:00 ~ LocalTime.MAX
        TimeSlotSplitter.Slice day1 = result.slices().get(0);
        assertThat(day1.date()).isEqualTo(MON);
        assertThat(day1.startTime()).isEqualTo(LocalTime.of(22, 0));
        assertThat(day1.endTime()).isEqualTo(LocalTime.MAX);

        // 둘째 날: LocalTime.MIN(00:00) ~ 06:00
        TimeSlotSplitter.Slice day2 = result.slices().get(1);
        assertThat(day2.date()).isEqualTo(TUE);
        assertThat(day2.startTime()).isEqualTo(LocalTime.MIN);
        assertThat(day2.endTime()).isEqualTo(LocalTime.of(6, 0));
    }

    @Test
    @DisplayName("자정 시작 (00:00–06:00) → Slice 1개 (자정 넘김 아님)")
    void startsAtMidnight() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.MIDNIGHT); // 00:00
        LocalDateTime end   = LocalDateTime.of(MON, LocalTime.of(6, 0));

        TimeSlotSplitter.Split result = TimeSlotSplitter.split(start, end);

        // 같은 날 내에서 시작·종료 → 분할 없음
        assertThat(result.slices()).hasSize(1);

        TimeSlotSplitter.Slice slice = result.slices().get(0);
        assertThat(slice.date()).isEqualTo(MON);
        assertThat(slice.startTime()).isEqualTo(LocalTime.MIN);
        assertThat(slice.endTime()).isEqualTo(LocalTime.of(6, 0));
    }

    @Test
    @DisplayName("분할 안 된 단일 레코드도 linkedGroupId 를 보유한다")
    void singleSlotHasLinkedGroupId() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.of(10, 0));
        LocalDateTime end   = LocalDateTime.of(MON, LocalTime.of(14, 0));

        TimeSlotSplitter.Split result = TimeSlotSplitter.split(start, end);

        assertThat(result.linkedGroupId()).isNotNull().hasSize(36);
    }

    @Test
    @DisplayName("자정 넘김 두 Slice 는 동일한 linkedGroupId 를 공유한다")
    void crossMidnightSharesSameGroupId() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.of(22, 0));
        LocalDateTime end   = LocalDateTime.of(TUE, LocalTime.of(6, 0));

        TimeSlotSplitter.Split result = TimeSlotSplitter.split(start, end);

        // Split 에 저장된 groupId 가 그대로 두 Slice 에 사용된다
        // (Slice 자체에 groupId 를 넣지 않는 구조이므로, Split.linkedGroupId 가 공통 값)
        assertThat(result.linkedGroupId()).hasSize(36);
        assertThat(result.slices()).hasSize(2);
    }

    // ─── 예외 케이스 ────────────────────────────────────────────────

    @Test
    @DisplayName("24시간 정각 (월 09:00 – 화 09:00) → IllegalArgumentException")
    void exactly24Hours_throws() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(TUE, LocalTime.of(9, 0)); // 정확히 1440분

        assertThatIllegalArgumentException()
                .isThrownBy(() -> TimeSlotSplitter.split(start, end))
                .withMessageContaining("24시간");
    }

    @Test
    @DisplayName("24시간 초과 (월 09:00 – 화 10:00) → IllegalArgumentException")
    void over24Hours_throws() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.of(9, 0));
        LocalDateTime end   = LocalDateTime.of(TUE, LocalTime.of(10, 0)); // 1500분

        assertThatIllegalArgumentException()
                .isThrownBy(() -> TimeSlotSplitter.split(start, end))
                .withMessageContaining("24시간");
    }

    @Test
    @DisplayName("endAt == startAt → IllegalArgumentException")
    void endEqualsStart_throws() {
        LocalDateTime moment = LocalDateTime.of(MON, LocalTime.of(9, 0));

        assertThatIllegalArgumentException()
                .isThrownBy(() -> TimeSlotSplitter.split(moment, moment));
    }

    @Test
    @DisplayName("endAt < startAt → IllegalArgumentException")
    void endBeforeStart_throws() {
        LocalDateTime start = LocalDateTime.of(MON, LocalTime.of(18, 0));
        LocalDateTime end   = LocalDateTime.of(MON, LocalTime.of(9, 0));

        assertThatIllegalArgumentException()
                .isThrownBy(() -> TimeSlotSplitter.split(start, end));
    }
}
