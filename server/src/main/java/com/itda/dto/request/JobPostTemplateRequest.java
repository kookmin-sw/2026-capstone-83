package com.itda.dto.request;

import java.util.List;

/**
 * 공고 템플릿 생성/수정 요청 DTO.
 */
public record JobPostTemplateRequest(
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
        List<String> items
) {}
