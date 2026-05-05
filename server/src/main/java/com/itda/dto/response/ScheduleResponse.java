package com.itda.dto.response;

import com.itda.entity.Application;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ScheduleResponse {

    private String date;
    private Long jobPostId;
    private String title;
    private String workStart;
    private String workEnd;

    public static ScheduleResponse from(Application application) {
        return ScheduleResponse.builder()
                .date(application.getJobPost().getWorkDate().toString())
                .jobPostId(application.getJobPost().getId())
                .title(application.getJobPost().getTitle())
                .workStart(application.getJobPost().getWorkStart().toString())
                .workEnd(application.getJobPost().getWorkEnd().toString())
                .build();
    }
}