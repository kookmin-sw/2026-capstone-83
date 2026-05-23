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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;


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
     * 사업장 등록 (multipart/form-data)
     * POST /api/v1/workplaces
     * - data: WorkplaceCreateRequest JSON
     * - companyLogoImage: 로고 이미지 파일 (선택)
     */
    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<WorkplaceResponse> createWorkplace(
            @RequestPart("data") WorkplaceCreateRequest request,
            @RequestPart(value = "companyLogoImage", required = false) MultipartFile companyLogoImage,
            @AuthenticationPrincipal User user) {
        WorkplaceResponse created = workplaceService.createWorkplace(request, companyLogoImage, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 사업장 수정 (multipart/form-data, 부분 수정)
     * PUT /api/v1/workplaces/{id}
     * - data: WorkplaceUpdateRequest JSON (null 필드는 기존 값 유지)
     * - companyLogoImage: 새 로고 이미지 파일 (선택, 없으면 기존 유지)
     */
    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<WorkplaceResponse> updateWorkplace(
            @PathVariable Long id,
            @RequestPart("data") WorkplaceUpdateRequest request,
            @RequestPart(value = "companyLogoImage", required = false) MultipartFile companyLogoImage,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(workplaceService.updateWorkplace(id, request, companyLogoImage, user));
    }

    /**
     * 사업장 삭제
     * DELETE /api/v1/workplaces/{id}
     * - 본인 소유 사업장만 삭제 가능 → 403
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
    // 사업장 존재 여부 확인
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Boolean>> hasWorkplace(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("exists", workplaceService.hasWorkplace(user)));
    }
}