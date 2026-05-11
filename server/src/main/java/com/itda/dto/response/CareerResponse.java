package com.itda.dto.response;

import com.itda.entity.Career;
import lombok.Builder;
import lombok.Getter;

// 경력사항 조회 응답 DTO
@Getter
@Builder
public class CareerResponse {

    private Long id;

    // 담당 업무명
    private String jobTitle;

    // 근무 기간 - 년
    private int years;

    // 근무 기간 - 개월
    private int months;

    public static CareerResponse from(Career career) {
        return CareerResponse.builder()
                .id(career.getId())
                .jobTitle(career.getJobTitle())
                .years(career.getYears())
                .months(career.getMonths())
                .build();
    }
}