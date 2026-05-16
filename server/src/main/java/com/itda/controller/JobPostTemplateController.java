package com.itda.controller;

import com.itda.dto.request.JobPostTemplateRequest;
import com.itda.dto.response.JobPostTemplateResponse;
import com.itda.entity.User;
import com.itda.service.JobPostTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
public class JobPostTemplateController {

    private final JobPostTemplateService templateService;

    /**
     * 내 템플릿 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<JobPostTemplateResponse>> getMyTemplates(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(templateService.getMyTemplates(user));
    }

    /**
     * 템플릿 상세 조회 (공고 등록 폼에 채울 데이터)
     */
    @GetMapping("/{id}")
    public ResponseEntity<JobPostTemplateResponse> getTemplate(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(templateService.getTemplate(user, id));
    }

    /**
     * 템플릿 생성
     */
    @PostMapping
    public ResponseEntity<JobPostTemplateResponse> createTemplate(
            @RequestBody JobPostTemplateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(templateService.createTemplate(user, request));
    }

    /**
     * 템플릿 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<JobPostTemplateResponse> updateTemplate(
            @PathVariable Long id,
            @RequestBody JobPostTemplateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(templateService.updateTemplate(user, id, request));
    }

    /**
     * 템플릿 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        templateService.deleteTemplate(user, id);
        return ResponseEntity.noContent().build();
    }
}
