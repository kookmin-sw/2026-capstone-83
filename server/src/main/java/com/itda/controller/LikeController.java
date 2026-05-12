package com.itda.controller;

import com.itda.entity.User;
import com.itda.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;

    // 공고 좋아요 토글 (구직자)
    @PostMapping("/api/v1/job-posts/{id}/like")
    public ResponseEntity<Map<String, Boolean>> toggleJobPostLike(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        boolean liked = likeService.toggleJobPostLike(id, user);
        return ResponseEntity.ok(Map.of("liked", liked));
    }

    // 이력서 좋아요 토글 (고용주)
    @PostMapping("/api/v1/resumes/{id}/like")
    public ResponseEntity<Map<String, Boolean>> toggleResumeLike(
            @PathVariable Long id,
            @AuthenticationPrincipal User user) {
        boolean liked = likeService.toggleResumeLike(id, user);
        return ResponseEntity.ok(Map.of("liked", liked));
    }
}