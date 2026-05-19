package com.itda.controller;

import com.itda.dto.response.ApplicantResponse;
import com.itda.dto.response.ApplicationResponse;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.calendar.EmployeeScheduleResponse;
import com.itda.entity.Application;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.service.ApplicationService;
import com.itda.repository.UserRepository;
import com.itda.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

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

    // 내 지원 내역 (커서 페이지네이션) - 공고 카드 + liked 포함
    @GetMapping("/api/v1/worker/applications")
    public ResponseEntity<CursorPageResponse<ApplicationResponse>> getMyApplications(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getMyApplications(user.getId(), cursor, size));
    }

    // 내 지원 내역 (status 필터) - 공고 카드 + liked 포함
    @GetMapping("/api/v1/worker/applications/filter")
    public ResponseEntity<List<ApplicationResponse>> getMyApplicationsByStatus(
            @RequestParam(required = false) String status,
            @AuthenticationPrincipal User user) {
        ApplicationStatus statusEnum = (status != null) ? ApplicationStatus.valueOf(status) : null;
        return ResponseEntity.ok(applicationService.getMyApplicationsByStatus(user.getId(), statusEnum));
    }

    // 근무 일정 조회
    @GetMapping("/api/v1/worker/schedule")
    public ResponseEntity<EmployeeScheduleResponse> getMySchedule(
            @RequestParam LocalDate fromDate,
            @RequestParam LocalDate toDate,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getEmployeeSchedules(user.getId(), fromDate, toDate));
    }

    // 지원 취소 (구직자)
    @PostMapping("/api/v1/applications/{id}/cancel")
    public ResponseEntity<Void> cancel(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        applicationService.cancel(id, user);
        return ResponseEntity.ok().build();
    }

    // ─── 고용주 API ───────────────────────────────────────────


    // 고용주 → 구직자 채용 제안
    // POST /api/v1/job-posts/{jobPostId}/offer/{userId}
    @PostMapping("/api/v1/job-posts/{jobPostId}/offer/{userId}")
    public ResponseEntity<Map<String, Long>> offer(
            @PathVariable Long jobPostId,
            @PathVariable Long userId,
            @AuthenticationPrincipal User user) {
        com.itda.entity.User applicant = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));
        Application application = applicationService.offer(jobPostId, applicant);
        return ResponseEntity.status(201).body(Map.of("applicationId", application.getId()));
    }

    // 지원자 목록 조회 (소유권 검증 + 커서 페이지네이션)
    @GetMapping("/api/v1/job-posts/{id}/applicants")
    public ResponseEntity<CursorPageResponse<ApplicantResponse>> getApplicants(
            @PathVariable Long id,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobPost(id, user.getId(), cursor, size));
    }

    // 공고별 근무자 목록 (소유권 검증)
    @GetMapping("/api/v1/job-posts/{id}/workers")
    public ResponseEntity<List<ApplicantResponse>> getWorkers(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.getWorkersByJobPost(id, user.getId()));
    }

    // 지원자 승인 (소유권 검증)
    @PostMapping("/api/v1/applications/{id}/accept")
    public ResponseEntity<ApplicantResponse> accept(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.hire(id, user.getId()));
    }

    // 지원자 거절 (소유권 검증)
    @PostMapping("/api/v1/applications/{id}/reject")
    public ResponseEntity<ApplicantResponse> reject(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.reject(id, user.getId()));
    }

    // 근무 완료 처리 (소유권 검증)
    @PostMapping("/api/v1/applications/{id}/complete")
    public ResponseEntity<ApplicantResponse> complete(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(applicationService.complete(id, user.getId()));
    }
}