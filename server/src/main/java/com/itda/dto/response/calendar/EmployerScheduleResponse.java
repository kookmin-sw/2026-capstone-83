package com.itda.dto.response.calendar;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 고용자 캘린더 응답 DTO
 */
public record EmployerScheduleResponse(
        LocalDate fromDate,
        LocalDate toDate,
        Map<LocalDate, List<EmployerScheduleItem>> schedules
) {
    public static EmployerScheduleResponse of(
            LocalDate fromDate,
            LocalDate toDate,
            Map<LocalDate, List<EmployerScheduleItem>> schedules) {
        return new EmployerScheduleResponse(fromDate, toDate, schedules);
    }
}
