package com.itda.dto.response.calendar;

import com.itda.entity.JobPost;
import com.itda.enums.ApplicationStatus;
import com.itda.entity.Application;
import java.util.List;

/**
 * 고용자 캘린더 일정 항목 DTO
 */
public record EmployerScheduleItem(
        Long jobPostId,
        String title,
        String workStart,
        String workEnd,
        int filledSlots,
        int totalSlots,
        String postStatus,
        String workplace,
        Long workplaceId,
        int applicantCount,
        int hiredCount
) {
    public static EmployerScheduleItem from(JobPost jobPost, int applicantCount, int hiredCount) {
        // 자정 분할된 Day1 레코드의 workEnd=LocalTime.MAX 를 "24:00" 으로 표시.
        // Day2 레코드(workStart=00:00, workEnd=06:00 등)는 그대로 표시.
        String workEndStr = jobPost.getWorkEnd().equals(java.time.LocalTime.MAX)
                ? "24:00"
                : jobPost.getWorkEnd().toString();
        return new EmployerScheduleItem(
                jobPost.getId(),
                jobPost.getTitle(),
                jobPost.getWorkStart().toString(),
                workEndStr,
                jobPost.getFilledSlots(),
                jobPost.getTotalSlots(),
                jobPost.getStatus().name(),
                jobPost.getWorkplace().getName(),
                jobPost.getWorkplace().getId(),
                applicantCount,
                hiredCount
        );
    }
}
