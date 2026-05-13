package com.itda.controller;

import com.itda.dto.request.ScheduleRequest;
import com.itda.dto.response.calendar.EmployerScheduleResponse;
import com.itda.entity.User;
import com.itda.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/calendar")
@RequiredArgsConstructor
public class CalendarController {

    private final ApplicationService applicationService;

    /**
     * 고용자 캘린더 일정 조회
     * GET /api/v1/calendar/employer?fromDate=2026-05-01&toDate=2026-05-31
     */
    @GetMapping("/employer")
    public ResponseEntity<EmployerScheduleResponse> getEmployerSchedules(
            @AuthenticationPrincipal User user,
            @ModelAttribute ScheduleRequest request) {
        return ResponseEntity.ok(applicationService.getEmployerSchedules(user.getId(), request));
    }
}
