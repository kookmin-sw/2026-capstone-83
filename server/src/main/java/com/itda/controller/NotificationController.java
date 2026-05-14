package com.itda.controller;

import com.itda.config.JwtTokenProvider;
import com.itda.dto.response.NotificationResponse;
import com.itda.entity.User;
import com.itda.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * SSE 전용 단기 토큰 발급 (30초 만료)
     * 클라이언트는 이 토큰을 받아 /subscribe?token={sseToken} 으로 SSE 연결
     */
    @PostMapping("/token")
    public ResponseEntity<Map<String, String>> issueSseToken(
            @AuthenticationPrincipal User user) {
        String sseToken = jwtTokenProvider.createSseToken(user.getId(), user.getRole().name());
        return ResponseEntity.ok(Map.of("sseToken", sseToken));
    }

    /**
     * SSE 구독 엔드포인트
     * 인증은 쿼리 파라미터의 SSE 전용 단기 토큰으로 처리
     */
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@AuthenticationPrincipal User user) {
        return notificationService.subscribe(user.getId());
    }

    /**
     * 미읽은 알림 목록 조회
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(user.getId()));
    }

    /**
     * 전체 알림 목록 조회 (최근 50개)
     */
    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(notificationService.getAllNotifications(user.getId()));
    }

    /**
     * 미읽은 알림 개수
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(user.getId())));
    }

    /**
     * 알림 읽음 처리
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 전체 읽음 처리
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }
}
