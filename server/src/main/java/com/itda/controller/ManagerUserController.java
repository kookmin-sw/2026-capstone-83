package com.itda.controller;

import com.itda.dto.request.SuspendRequest;
import com.itda.dto.response.ManagerUserResponse;
import com.itda.enums.UserRole;
import com.itda.enums.UserStatus;
import com.itda.service.ManagerUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/manager/users")
public class ManagerUserController {

    private final ManagerUserService managerUserService;

    /**
     * 회원 목록 검색 (이름/이메일 검색, 역할/상태 필터, 페이지네이션)
     */
    @GetMapping
    public ResponseEntity<Page<ManagerUserResponse>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(managerUserService.searchUsers(keyword, role, status, page, size));
    }

    /**
     * 회원 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ManagerUserResponse> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(managerUserService.getUser(id));
    }

    /**
     * 회원 정지 처리 (기간 정지 / 영구 정지)
     */
    @PatchMapping("/{id}/suspend")
    public ResponseEntity<ManagerUserResponse> suspendUser(
            @PathVariable Long id,
            @RequestBody SuspendRequest request) {
        return ResponseEntity.ok(managerUserService.suspendUser(id, request));
    }

    /**
     * 회원 정지 해제
     */
    @PatchMapping("/{id}/activate")
    public ResponseEntity<ManagerUserResponse> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(managerUserService.activateUser(id));
    }
}
