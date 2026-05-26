package com.itda.service.event;

import com.itda.service.AutoMatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * 자동 매칭 이벤트 리스너.
 *
 * <p>{@code eventsExecutor} 스레드 풀에서 비동기 처리하므로 사용자 요청 레이턴시와 분리된다.
 * {@link AutoMatchService} 의 내부 예외는 여기서 마지막으로 잡아 warn 로그만 남기고 흡수한다.
 *
 * <p>{@code @Transactional} 을 붙이지 않는다 — 트랜잭션 경계는
 * {@link com.itda.service.AutoMatchTransactionalSupport#tryCreate} 에서 개별 관리된다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AutoMatchEventListener {

    private final AutoMatchService autoMatchService;

    /**
     * 구직자 가용시간 등록/수정 이벤트 처리.
     * 가용시간 범위에 포함되는 OPEN 공고와 자동 매칭을 시도한다.
     */
    @Async("eventsExecutor")
    @EventListener
    public void onAvailabilityCreated(AutoMatchEvents.AvailabilityCreatedEvent event) {
        try {
            autoMatchService.matchForAvailability(event);
        } catch (Exception e) {
            log.warn("[AutoMatch] AvailabilityCreatedEvent 처리 실패 — userId={}, availId={}, err={}",
                    event.userId(), event.availabilityId(), e.getMessage());
        }
    }

    /**
     * 구인 공고 등록 이벤트 처리.
     * 공고 시간대를 포함하는 가용시간을 가진 구직자와 자동 매칭을 시도한다.
     */
    @Async("eventsExecutor")
    @EventListener
    public void onJobPostCreated(AutoMatchEvents.JobPostCreatedEvent event) {
        try {
            autoMatchService.matchForJobPost(event);
        } catch (Exception e) {
            log.warn("[AutoMatch] JobPostCreatedEvent 처리 실패 — jobPostId={}, err={}",
                    event.jobPostId(), e.getMessage());
        }
    }
}
