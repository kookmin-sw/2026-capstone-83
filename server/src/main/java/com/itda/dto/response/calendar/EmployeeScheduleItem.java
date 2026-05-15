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
        return new EmployeeScheduleItem(
                jobPost.getId(),
                jobPost.getTitle(),
                jobPost.getWorkStart().toString(),
                jobPost.getWorkEnd().toString(),
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
