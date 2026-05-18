package com.itda.dto.request;

import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ScheduleRequest {
    private LocalDate fromDate;
    private LocalDate toDate;
}
