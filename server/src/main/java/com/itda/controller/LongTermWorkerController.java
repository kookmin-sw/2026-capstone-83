package com.itda.controller;

import com.itda.entity.User;
import com.itda.dto.response.ResumeCardResponse;
import com.itda.service.LongTermWorkerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;


@RestController
@RequestMapping("/api/v1/long-term-workers")
@RequiredArgsConstructor
public class LongTermWorkerController {

    private final LongTermWorkerService longTermWorkerService;

    // 장기근무 토글 (고용주)
    @PostMapping("/{applicantUserId}/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleLongTermWorker(
            @PathVariable Long applicantUserId,
            @AuthenticationPrincipal User user) {
        boolean result = longTermWorkerService.toggleLongTermWorker(applicantUserId, user);
        return ResponseEntity.ok(Map.of("longTerm", result));
    }

    // 장기근무 여부 확인
    @GetMapping("/{applicantUserId}")
    public ResponseEntity<Map<String, Boolean>> isLongTermWorker(
            @PathVariable Long applicantUserId,
            @AuthenticationPrincipal User user) {
        boolean result = longTermWorkerService.isLongTermWorker(user.getId(), applicantUserId);
        return ResponseEntity.ok(Map.of("longTerm", result));
    }
    // 장기근무 등록한 구직자 ID 목록 (고용주)
    @GetMapping
    public ResponseEntity<List<Long>> getLongTermWorkerIds(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(longTermWorkerService.getLongTermWorkerIds(user.getId()));
    }
    // 장기근무 등록한 구직자 목록 (고용주)
    @GetMapping
    public ResponseEntity<List<ResumeCardResponse>> getLongTermWorkers(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(longTermWorkerService.getLongTermWorkers(user.getId()));
    }
}