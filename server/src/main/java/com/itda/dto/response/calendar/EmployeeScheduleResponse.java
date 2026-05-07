package com.itda.dto.response.calendar;

import com.itda.entity.Application;

/**
 * 구직자 캘린더 일정 항목 DTO
 */
public record EmployeeScheduleResponse(
        Long jobPostId,
        String title,
        String workStart,
        String workEnd
) {
    public static EmployeeScheduleResponse from(Application application) {
        return new EmployeeScheduleResponse(
                application.getJobPost().getId(),
                application.getJobPost().getTitle(),
                application.getJobPost().getWorkStart().toString(),
                application.getJobPost().getWorkEnd().toString()
        );
    }
}
