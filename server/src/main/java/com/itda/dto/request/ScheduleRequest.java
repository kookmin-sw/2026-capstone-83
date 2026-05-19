package com.itda.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ScheduleRequest {
    private LocalDate fromDate;
    private LocalDate toDate;
    private Long workplaceId;  // 옵셔널: 특정 사업장 필터 (null이면 전체)
}
