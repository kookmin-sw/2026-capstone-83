package com.itda.dto.request;

import lombok.Getter;

// 경력사항 등록/수정 요청 DTO
@Getter
public class CareerRequest {

    // 담당 업무명 (ex. 물류 센터 하차)
    private String jobTitle;

    // 근무 기간 - 년
    private int years;

    // 근무 기간 - 개월
    private int months;
}