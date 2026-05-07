package com.itda.dto.response.calendar;

import com.itda.entity.JobPost;

/**
 * 고용자 캘린더 일정 항목 DTO
 */
public record EmployerScheduleItem(
        Long jobPostId,
        String title,
        String workStart,
        String workEnd,
        int applicantCount,
        int filledSlots
) {
    public static EmployerScheduleItem from(JobPost jobPost, int applicantCount) {
        return new EmployerScheduleItem(
                jobPost.getId(),
                jobPost.getTitle(),
                jobPost.getWorkStart().toString(),
                jobPost.getWorkEnd().toString(),
                applicantCount,
                jobPost.getFilledSlots()
        );
    }
}
