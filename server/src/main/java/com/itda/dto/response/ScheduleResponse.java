package com.itda.dto.response;

import com.itda.entity.Application;
import com.itda.dto.response.ScheduleResponse;
import lombok.Builder;
import lombok.Getter;
import java.util.List;

@Getter
@Builder
public class ScheduleResponse {

    private String date;
    private List<ScheduleItemResponse> schedules;

    @Getter
    @Builder
    public static class ScheduleItemResponse {
        private Long jobPostId;
        private String title;
        private String workStart;
        private String workEnd;

        public static ScheduleItemResponse from(Application application) {
            return ScheduleItemResponse.builder()
                    .jobPostId(application.getJobPost().getId())
                    .title(application.getJobPost().getTitle())
                    .workStart(application.getJobPost().getWorkStart().toString())
                    .workEnd(application.getJobPost().getWorkEnd().toString())
                    .build();
        }
    }
}