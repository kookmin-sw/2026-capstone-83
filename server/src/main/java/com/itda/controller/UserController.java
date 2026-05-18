package com.itda.controller;

import com.itda.dto.request.PasswordChangeRequest;
import com.itda.dto.request.UserProfileUpdateRequest;
import com.itda.dto.response.UserProfileResponse;
import com.itda.entity.User;
import com.itda.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /**
     * 내 정보 조회
     */
    @GetMapping
    public ResponseEntity<UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getMyProfile(user.getId()));
    }

    /**
     * 내 정보 수정 (null 필드는 기존 값 유지)
     */
    @PutMapping
    public ResponseEntity<UserProfileResponse> updateMyProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UserProfileUpdateRequest request) {
        return ResponseEntity.ok(userService.updateMyProfile(user.getId(), request));
    }

    /**
     * 비밀번호 변경
     */
    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody PasswordChangeRequest request) {
        userService.changePassword(user.getId(), request);
        return ResponseEntity.ok().build();
    }

    /**
     * 프로필 이미지 업로드
     */
    @PostMapping(value = "/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserProfileResponse> updateProfileImage(
            @AuthenticationPrincipal User user,
            @RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(userService.updateProfileImage(user.getId(), image));
    }
}
