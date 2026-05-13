package com.itda.controller;

import com.itda.dto.request.WorkplaceCreateRequest;
import com.itda.dto.request.WorkplaceUpdateRequest;
import com.itda.dto.response.WorkplaceResponse;
import com.itda.entity.User;
import com.itda.service.WorkplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workplaces")
@RequiredArgsConstructor
public class WorkplaceController {

    private final WorkplaceService workplaceService;

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
     * 사업장 상세 조회 (본인 소유만)
     * GET /api/v1/workplaces/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<WorkplaceResponse> getWorkplace(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workplaceService.getWorkplace(id, user));
    }

    /**
     * 사업장 등록
     * POST /api/v1/workplaces
     */
    @PostMapping
    public ResponseEntity<WorkplaceResponse> createWorkplace(
            @RequestBody WorkplaceCreateRequest request,
            @AuthenticationPrincipal User user) {
        WorkplaceResponse created = workplaceService.createWorkplace(request, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 사업장 수정 (부분 수정)
     * PUT /api/v1/workplaces/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<WorkplaceResponse> updateWorkplace(
            @PathVariable Long id,
            @RequestBody WorkplaceUpdateRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workplaceService.updateWorkplace(id, request, user));
    }

    /**
     * 사업장 삭제
     * DELETE /api/v1/workplaces/{id}
     *
     * - 인증 필요 (Authorization: Bearer ...)
     * - 본인 소유 사업장만 삭제 가능 → 그렇지 않으면 403
     * - 연결된 공고가 있으면 409
     * - 성공 시 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkplace(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        workplaceService.deleteWorkplace(id, user);
        return ResponseEntity.noContent().build();
    }
}
