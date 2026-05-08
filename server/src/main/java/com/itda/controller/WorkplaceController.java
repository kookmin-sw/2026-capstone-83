package com.itda.controller;

import com.itda.dto.request.WorkplaceCreateRequest;
import com.itda.dto.response.WorkplaceResponse;
import com.itda.entity.User;
import com.itda.service.WorkplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 사업장(Workplace) 관리 API.
 * 모든 엔드포인트는 EMPLOYER 권한 필요 (SecurityConfig에서 처리).
 */
@RestController
@RequestMapping("/api/v1/workplaces")
@RequiredArgsConstructor
public class WorkplaceController {

    private final WorkplaceService workplaceService;

    /**
     * 사업장 등록
     * POST /api/v1/workplaces
     */
    @PostMapping
    public ResponseEntity<WorkplaceResponse> createWorkplace(
            @AuthenticationPrincipal User user,
            @RequestBody WorkplaceCreateRequest request) {
        WorkplaceResponse created = workplaceService.createMyWorkplace(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 내 사업장 목록 조회
     * GET /api/v1/workplaces/me
     */
    @GetMapping("/me")
    public ResponseEntity<List<WorkplaceResponse>> getMyWorkplaces(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workplaceService.getMyWorkplaces(user));
    }

    /**
     * 사업장 단건 조회 (본인 소유만)
     * GET /api/v1/workplaces/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkplaceResponse> getWorkplace(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(workplaceService.getMyWorkplace(user, id));
    }
}
