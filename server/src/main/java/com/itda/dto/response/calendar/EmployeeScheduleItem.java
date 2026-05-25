package com.itda.dto.response.calendar;

import com.itda.entity.Application;
import com.itda.entity.JobPost;

/**
 * 구직자 캘린더 일정 항목 DTO
 */
public record EmployeeScheduleItem(
        Long jobPostId,
        String title,
        String workStart,
        String workEnd,
        int filledSlots,
        int totalSlots,
        String postStatus,
        String applyStatus,
        String company,
        String location,
        Integer wage
) {
    public static EmployeeScheduleItem from(Application application) {
        JobPost jobPost = application.getJobPost();
        // 자정 분할된 Day1 레코드의 workEnd=LocalTime.MAX 를 "24:00" 으로 표시.
        String workEndStr = jobPost.getWorkEnd().equals(java.time.LocalTime.MAX)
                ? "24:00"
                : jobPost.getWorkEnd().toString();
        return new EmployeeScheduleItem(
                jobPost.getId(),
                jobPost.getTitle(),
                jobPost.getWorkStart().toString(),
                workEndStr,
                jobPost.getFilledSlots(),
                jobPost.getTotalSlots(),
                jobPost.getStatus().name(),
                application.getStatus().name(),
                jobPost.getWorkplace().getCompanyName(),
                jobPost.getWorkplace().getAddress(),
                jobPost.getWage()
        );
    }
}
