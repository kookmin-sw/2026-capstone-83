package com.itda.dto.response.calendar;

import java.util.List;
import java.util.Map;

/**
 * 구직자 캘린더 응답 DTO
 */
public record EmployeeScheduleResponse(
        Map<String, List<EmployeeScheduleItem>> schedules
) {
    public static EmployeeScheduleResponse of(Map<String, List<EmployeeScheduleItem>> schedules) {
        return new EmployeeScheduleResponse(schedules);
    }
}
