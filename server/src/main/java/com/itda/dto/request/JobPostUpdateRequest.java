package com.itda.dto.request;

import java.util.List;

/**
 * 공고 수정 요청 DTO
 * - null 필드는 기존 값 유지 (부분 수정)
 * - 이미지 변경은 multipart로 별도 전달 (descriptionImage)
 * - workplaceId, filledSlots, status는 수정 불가
 */
public record JobPostUpdateRequest(
        String title,
        String jobCategory,
        String jobSubcategory,
        Integer wage,
        String wageType,
        String workDate,
        String workStart,
        String workEnd,
        Integer totalSlots,
        String deadline,
        String description,
        List<String> requirements,
        List<String> benefits,
        List<String> tasks,
        List<String> items,
        List<String> ageRequirements,
        Boolean urgentEnabled,
        Integer urgentWageIncrease,
        Boolean autoOfferEnabled
) {}