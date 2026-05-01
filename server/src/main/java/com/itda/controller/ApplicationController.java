package com.itda.controller;

import com.itda.dto.response.ApplicantResponse;
import com.itda.dto.response.ApplicationResponse;
import com.itda.dto.response.CursorPageResponse;
import com.itda.entity.Application;
import com.itda.entity.User;
import com.itda.repository.UserRepository;
import com.itda.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final UserRepository userRepository;

    // 지원자 → 공고 지원
    @PostMapping("/apply")
    public ResponseEntity<Application> apply(
            @RequestParam Long jobPostId,
            @RequestParam Long applicantUserId) {
        User applicant = userRepository.findById(applicantUserId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        return ResponseEntity.ok(applicationService.apply(jobPostId, applicant));
    }

    // 고용주 → 지원자에게 제안
    @PostMapping("/offer")
    public ResponseEntity<Application> offer(
            @RequestParam Long jobPostId,
            @RequestParam Long applicantUserId) {
        User applicant = userRepository.findById(applicantUserId)
                .orElseThrow(() -> new RuntimeException("유저를 찾을 수 없습니다."));
        return ResponseEntity.ok(applicationService.offer(jobPostId, applicant));
    }

    // 고용주 → 채용 확정
    @PatchMapping("/{applicationId}/hire")
    public ResponseEntity<ApplicantResponse> hire(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.hire(applicationId));
    }

    // 고용주 → 거절
    @PatchMapping("/{applicationId}/reject")
    public ResponseEntity<ApplicantResponse> reject(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.reject(applicationId));
    }

    // 공고별 지원자 목록 (고용주) - 커서 페이지네이션
    @GetMapping("/job-post/{jobPostId}")
    public ResponseEntity<CursorPageResponse<ApplicantResponse>> getApplicationsByJobPost(
            @PathVariable Long jobPostId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobPost(jobPostId, cursor, size));
    }

    // 공고별 근무자 목록 (고용주) - HIRED 상태인 지원자만
    @GetMapping("/job-post/{jobPostId}/workers")
    public ResponseEntity<List<ApplicantResponse>> getWorkersByJobPost(@PathVariable Long jobPostId) {
        return ResponseEntity.ok(applicationService.getWorkersByJobPost(jobPostId));
    }

    // 근무 완료 처리 (고용주)
    @PostMapping("/{applicationId}/complete")
    public ResponseEntity<ApplicantResponse> complete(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.complete(applicationId));
    }

    // 내 지원 목록 (지원자) - 커서 페이지네이션
    @GetMapping("/applicant/{applicantUserId}")
    public ResponseEntity<CursorPageResponse<ApplicationResponse>> getMyApplications(
            @PathVariable Long applicantUserId,
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(applicationService.getMyApplications(applicantUserId, cursor, size));
    }
}