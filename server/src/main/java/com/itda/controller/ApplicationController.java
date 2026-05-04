package com.itda.controller;

import com.itda.dto.response.ApplicationResponse;
import com.itda.dto.response.ScheduleResponse;
import com.itda.entity.Application;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    // ─── 구직자 API ───────────────────────────────────────────

    // 공고 지원
    @PostMapping("/api/v1/job-posts/{id}/apply")
    public ResponseEntity<Map<String, Long>> apply(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        Application application = applicationService.apply(id, user);
        return ResponseEntity.status(201).body(Map.of("applicationId", application.getId()));
    }

    // 지원 여부 확인
    @GetMapping("/api/v1/job-posts/{id}/applied")
    public ResponseEntity<Map<String, Boolean>> checkApplied(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        boolean applied = applicationService.hasApplied(id, user.getId());
        return ResponseEntity.ok(Map.of("applied", applied));
    }

    // 지원자 → 제안 수락 (OFFERED → PENDING)
    @PostMapping("/api/v1/applications/{id}/accept-offer")
    public ResponseEntity<Void> acceptOffer(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        applicationService.acceptOffer(id);
        return ResponseEntity.ok().build();
    }

    // 내 지원 내역
    @GetMapping("/api/v1/worker/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal User user) {
        ApplicationStatus statusEnum = (status != null) ? ApplicationStatus.valueOf(status) : null;
        List<ApplicationResponse> result = applicationService
                .getMyApplications(user.getId(), statusEnum)
                .stream()
                .map(ApplicationResponse::from)
                .toList();
        return ResponseEntity.ok(result);
    }

    // 근무 일정 조회
    @GetMapping("/api/v1/worker/schedule")
    public ResponseEntity<List<ScheduleResponse>> getMySchedule(
            @RequestParam int year,
            @RequestParam int month,
            @AuthenticationPrincipal User user) {
        List<ScheduleResponse> result = applicationService
                .getMySchedule(user.getId(), year, month)
                .stream()
                .map(ScheduleResponse::from)
                .toList();
        return ResponseEntity.ok(result);
    }

    // ─── 고용주 API ───────────────────────────────────────────

    // 지원자 목록 조회
    @GetMapping("/api/v1/job-posts/{id}/applicants")
    public ResponseEntity<List<Application>> getApplicants(@PathVariable Long id) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobPost(id));
    }

    // 지원자 승인
    @PostMapping("/api/v1/applications/{id}/accept")
    public ResponseEntity<Void> accept(@PathVariable Long id) {
        applicationService.hire(id);
        return ResponseEntity.ok().build();
    }

    // 지원자 거절
    @PostMapping("/api/v1/applications/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long id) {
        applicationService.reject(id);
        return ResponseEntity.ok().build();
    }
}