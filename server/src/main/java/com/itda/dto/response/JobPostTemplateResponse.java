package com.itda.dto.response;

import com.itda.entity.JobPostTemplate;

import java.util.List;

/**
 * 공고 템플릿 응답 DTO.
 */
public record JobPostTemplateResponse(
        Long id,
        String templateName,
        String title,
        String jobCategory,
        String jobSubcategory,
        Integer wage,
        String wageType,
        String workStart,
        String workEnd,
        Integer totalSlots,
        String description,
        List<String> requirements,
        List<String> benefits,
        List<String> tasks,
        List<String> items,
        Boolean urgentEnabled,
        Integer urgentWageIncrease,
        Boolean autoOfferEnabled,
        String createdAt,
        String updatedAt
) {
    public static JobPostTemplateResponse from(JobPostTemplate t) {
        return new JobPostTemplateResponse(
                t.getId(),
                t.getTemplateName(),
                t.getTitle(),
                t.getJobCategory(),
                t.getJobSubcategory(),
                t.getWage(),
                t.getWageType() != null ? t.getWageType().name() : null,
                t.getWorkStart() != null ? t.getWorkStart().toString() : null,
                t.getWorkEnd() != null ? t.getWorkEnd().toString() : null,
                t.getTotalSlots(),
                t.getDescription(),
                t.getRequirements(),
                t.getBenefits(),
                t.getTasks(),
                t.getItems(),
                t.getUrgentEnabled(),
                t.getUrgentWageIncrease(),
                t.getAutoOfferEnabled(),
                t.getCreatedAt() != null ? t.getCreatedAt().toString() : null,
                t.getUpdatedAt() != null ? t.getUpdatedAt().toString() : null
        );
    }
}
