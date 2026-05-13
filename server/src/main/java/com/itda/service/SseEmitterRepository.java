package com.itda.service;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 인메모리 SseEmitter 저장소
 * userId → SseEmitter 매핑을 관리
 */
@Component
public class SseEmitterRepository {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter save(Long userId, SseEmitter emitter) {
        emitters.put(userId, emitter);
        return emitter;
    }

    public Optional<SseEmitter> findByUserId(Long userId) {
        return Optional.ofNullable(emitters.get(userId));
    }

    public void deleteByUserId(Long userId) {
        emitters.remove(userId);
    }
}
