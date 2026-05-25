package com.itda.controller;

import com.itda.dto.request.CareerRequest;
import com.itda.dto.request.CertificateRequest;
import com.itda.dto.request.ResumeRequest;
import com.itda.dto.response.ResumeResponse;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.ResumeCardResponse;
import com.itda.entity.User;
import com.itda.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    // 이력서 조회
    @GetMapping
    public ResponseEntity<ResumeResponse> getResume(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getResume(user));
    }

    // 좋아요한 이력서 목록 조회 (고용주)
    @GetMapping("/liked")
    public ResponseEntity<CursorPageResponse<ResumeCardResponse>> getLikedResumes(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getLikedResumes(user.getId(), cursor, size));
    }

    // 이력서 상세 조회 (고용주용)
    @GetMapping("/{resumeId}")
    public ResponseEntity<ResumeResponse> getResumeDetail(
            @PathVariable Long resumeId,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getResumeDetail(resumeId, user));
    }

    // 이력서 등록/수정
    @PutMapping
    public ResponseEntity<Void> saveResume(
            @AuthenticationPrincipal User user,
            @RequestBody ResumeRequest request) {
        resumeService.saveResume(user, request);
        return ResponseEntity.ok().build();
    }
    // 인재 목록 조회 (커서 페이지네이션)
    @GetMapping("/list")
    public ResponseEntity<CursorPageResponse<ResumeCardResponse>> getResumeList(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resumeService.getResumeList(cursor, size, user));
    }

    // 경력 추가
    @PostMapping("/careers")
    public ResponseEntity<Void> addCareer(
            @AuthenticationPrincipal User user,
            @RequestBody CareerRequest request) {
        resumeService.addCareer(user, request);
        return ResponseEntity.status(201).build();
    }

    // 경력 수정
    @PutMapping("/careers/{id}")
    public ResponseEntity<Void> updateCareer(
            @PathVariable Long id,
            @RequestBody CareerRequest request) {
        resumeService.updateCareer(id, request);
        return ResponseEntity.ok().build();
    }

    // 경력 삭제
    @DeleteMapping("/careers/{id}")
    public ResponseEntity<Void> deleteCareer(@PathVariable Long id) {
        resumeService.deleteCareer(id);
        return ResponseEntity.ok().build();
    }

    // 자격/인증 추가
    @PostMapping("/certificates")
    public ResponseEntity<Void> addCertificate(
            @AuthenticationPrincipal User user,
            @RequestBody CertificateRequest request) {
        resumeService.addCertificate(user, request);
        return ResponseEntity.status(201).build();
    }

    // 자격/인증 삭제
    @DeleteMapping("/certificates/{id}")
    public ResponseEntity<Void> deleteCertificate(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        resumeService.deleteCertificate(id, user);
        return ResponseEntity.ok().build();
    }


    /**
     * 이력서 증명사진 등록/수정
     * POST /api/v1/resume/photo
     */
    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> updateResumePhoto(
            @AuthenticationPrincipal User user,
            @RequestPart("photo") MultipartFile photo) {
        resumeService.updateResumePhoto(user, photo);
        return ResponseEntity.ok().build();
    }

    /**
     * 이력서 증명사진 삭제
     * DELETE /api/v1/resume/photo
     */
    @DeleteMapping("/photo")
    public ResponseEntity<Void> deleteResumePhoto(
            @AuthenticationPrincipal User user) {
        resumeService.deleteResumePhoto(user);
        return ResponseEntity.noContent().build();
    }

    // 이력서 존재 여부 확인
    @GetMapping("/exists")
    public ResponseEntity<Map<String, Boolean>> hasResume(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("exists", resumeService.hasResume(user)));
    }

}