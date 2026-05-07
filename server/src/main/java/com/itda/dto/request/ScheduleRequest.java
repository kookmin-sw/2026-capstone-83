package com.itda.dto.request;

import java.time.LocalDate;

/**
 * 캘린더 일정 조회 요청 DTO (공통)
 */
public record ScheduleRequest(
        LocalDate startDate,
        LocalDate endDate
) {
}
