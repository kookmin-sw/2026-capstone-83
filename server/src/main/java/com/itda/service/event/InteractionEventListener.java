package com.itda.service.event;

import com.itda.entity.JobPostClickLog;
import com.itda.entity.JobPostImpressionLog;
import com.itda.repository.JobPostClickLogRepository;
import com.itda.repository.JobPostImpressionLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 노출/클릭 이벤트를 별도 스레드에서 받아 로그 테이블에 적재한다.
 *
 * - 이벤트 처리 실패가 사용자 요청을 깨뜨리지 않도록 try/catch + log 만 남기고 흡수
 * - INSERT 가 다수일 수 있어 saveAll 로 배치 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class InteractionEventListener {

    private final JobPostImpressionLogRepository impressionRepo;
    private final JobPostClickLogRepository clickRepo;

    @Async("eventsExecutor")
    @EventListener
    @Transactional
    public void onImpressionBatch(InteractionEvents.ImpressionBatchEvent event) {
        try {
            List<JobPostImpressionLog> rows = event.impressions().stream()
                    .map(imp -> JobPostImpressionLog.builder()
                            .userId(event.userId())
                            .postId(imp.postId())
                            .position(imp.position())
                            .sortType(event.sortType())
                            .requestId(event.requestId())
                            .at(event.at())
                            .build())
                    .toList();
            impressionRepo.saveAll(rows);
        } catch (Exception e) {
            log.warn("ImpressionBatchEvent 적재 실패 — requestId={}, size={}, err={}",
                    event.requestId(), event.impressions().size(), e.getMessage());
        }
    }

    @Async("eventsExecutor")
    @EventListener
    @Transactional
    public void onClick(InteractionEvents.ClickEvent event) {
        try {
            clickRepo.save(JobPostClickLog.builder()
                    .userId(event.userId())
                    .postId(event.postId())
                    .referrerSortType(event.referrerSortType())
                    .requestId(event.requestId())
                    .at(event.at())
                    .build());
        } catch (Exception e) {
            log.warn("ClickEvent 적재 실패 — postId={}, err={}", event.postId(), e.getMessage());
        }
    }
}
