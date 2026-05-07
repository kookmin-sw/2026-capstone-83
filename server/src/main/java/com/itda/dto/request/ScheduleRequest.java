package com.itda.dto.request;

import lombok.Getter;
import java.time.LocalDate;

@Getter
public class ScheduleRequest {
    private LocalDate fromDate;
    private LocalDate toDate;
}
