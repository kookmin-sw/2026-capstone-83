package com.itda.dto.response;

import com.itda.entity.Application;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ApplicationResponse {

    private Long applicationId;
    private Long jobPostId;
    private String title;
    private String company;
    private String status;
    private String appliedAt;

    public static ApplicationResponse from(Application application) {
        return ApplicationResponse.builder()
                .applicationId(application.getId())
                .jobPostId(application.getJobPost().getId())
                .title(application.getJobPost().getTitle())
                .company(application.getJobPost().getWorkplace().getCompanyName())
                .status(application.getStatus().name())
                .appliedAt(application.getAppliedAt().toString())
                .build();
    }
}