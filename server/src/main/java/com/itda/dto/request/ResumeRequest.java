package com.itda.dto.request;

import com.itda.enums.Education;
import com.itda.enums.EducationStatus;
import lombok.Getter;

// 이력서 등록/수정 요청 DTO
@Getter
public class ResumeRequest {

    // 최종 학력
    private Education education;

    // 재학 상태
    private EducationStatus educationStatus;

    // 전공
    private String major;
}