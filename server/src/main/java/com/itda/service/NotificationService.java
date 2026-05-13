package com.itda.service;

import com.itda.dto.response.NotificationResponse;
import com.itda.entity.Notification;
import com.itda.enums.NotificationType;
import com.itda.exception.NotFoundException;
import com.itda.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private static final Long SSE_TIMEOUT = 30L * 60 * 1000; // 30분

    private final NotificationRepository notificationRepository;
    private final SseEmitterRepository sseEmitterRepository;

    /**
     * SSE 구독 - 클라이언트가 연결할 때 호출
     */
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        // 기존 연결이 있으면 제거
        sseEmitterRepository.deleteByUserId(userId);
        sseEmitterRepository.save(userId, emitter);

        // 연결 종료 시 정리
        emitter.onCompletion(() -> sseEmitterRepository.deleteByUserId(userId));
        emitter.onTimeout(() -> sseEmitterRepository.deleteByUserId(userId));
        emitter.onError(e -> sseEmitterRepository.deleteByUserId(userId));

        // 연결 직후 더미 이벤트 전송 (503 방지)
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected"));
        } catch (IOException e) {
            log.error("SSE 초기 연결 이벤트 전송 실패: userId={}", userId, e);
            sseEmitterRepository.deleteByUserId(userId);
        }

        return emitter;
    }

    /**
     * 알림 생성 + DB 저장 + 실시간 전송
     */
    @Transactional
    public void notify(Long receiverUserId, NotificationType type, String message, Long relatedId) {
        // 1. DB에 저장
        Notification notification = Notification.builder()
                .receiverUserId(receiverUserId)
                .type(type)
                .message(message)
                .relatedId(relatedId)
                .build();
        Notification saved = notificationRepository.save(notification);

        // 2. SSE로 실시간 전송 시도
        sseEmitterRepository.findByUserId(receiverUserId).ifPresent(emitter -> {
            try {
                emitter.send(SseEmitter.event()
                        .name("notification")
                        .data(NotificationResponse.from(saved)));
            } catch (IOException e) {
                log.warn("SSE 전송 실패, 연결 제거: userId={}", receiverUserId);
                sseEmitterRepository.deleteByUserId(receiverUserId);
            }
        });
    }

    /**
     * 미읽은 알림 목록 조회
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications(Long userId) {
        return notificationRepository
                .findByReceiverUserIdAndIsReadFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    /**
     * 전체 알림 목록 조회 (최근 50개)
     */
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAllNotifications(Long userId) {
        return notificationRepository
                .findTop50ByReceiverUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    /**
     * 미읽은 알림 개수
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByReceiverUserIdAndIsReadFalse(userId);
    }

    /**
     * 알림 읽음 처리
     */
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("알림을 찾을 수 없습니다."));
        notification.markAsRead();
        notificationRepository.save(notification);
    }

    /**
     * 전체 읽음 처리
     */
    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unread = notificationRepository
                .findByReceiverUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unread.forEach(Notification::markAsRead);
        notificationRepository.saveAll(unread);
    }
}
