package com.itda.controller;

import com.itda.dto.request.ScheduleRequest;
import com.itda.dto.response.calendar.EmployerScheduleResponse;
import com.itda.service.CalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    /**
     * 고용자 캘린더 일정 조회
     * GET /api/v1/calendar/employer?startDate=2026-05-01&endDate=2026-05-31
     */
    @GetMapping("/employer")
    public ResponseEntity<EmployerScheduleResponse> getEmployerSchedules(
            @RequestParam Long employerId,
            @ModelAttribute ScheduleRequest request) {
        return ResponseEntity.ok(calendarService.getEmployerSchedules(employerId, request));
    }
}
