package com.itda.controller;

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
    public ResponseEntity<Application> hire(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.hire(applicationId));
    }

    // 고용주 → 거절
    @PatchMapping("/{applicationId}/reject")
    public ResponseEntity<Application> reject(@PathVariable Long applicationId) {
        return ResponseEntity.ok(applicationService.reject(applicationId));
    }

    // 공고별 지원자 목록 (고용주)
    @GetMapping("/job-post/{jobPostId}")
    public ResponseEntity<List<Application>> getApplicationsByJobPost(@PathVariable Long jobPostId) {
        return ResponseEntity.ok(applicationService.getApplicationsByJobPost(jobPostId));
    }

    // 내 지원 목록 (지원자)
    @GetMapping("/applicant/{applicantUserId}")
    public ResponseEntity<List<Application>> getMyApplications(@PathVariable Long applicantUserId) {
        return ResponseEntity.ok(applicationService.getMyApplications(applicantUserId));
    }
}