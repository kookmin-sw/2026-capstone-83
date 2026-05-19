package com.itda.controller;

import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.ResumeCardResponse;
import com.itda.entity.User;
import com.itda.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class ResumeListController {

    private final ResumeService resumeService;

    /**
     * 인재 목록 조회 (고용주용, 커서 페이지네이션)
     * GET /api/v1/resumes
     */
    @GetMapping
    public ResponseEntity<CursorPageResponse<ResumeCardResponse>> getResumeList(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getResumeList(cursor, size, user));
    }
}