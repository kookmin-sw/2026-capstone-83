package com.itda.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * @Async 활성화 + 이벤트 로깅 전용 스레드 풀.
 *
 * - eventsExecutor: 노출/클릭 로그 INSERT 처리. 사용자 응답 스레드와 분리해
 *   로그 적재 지연이 사용자 요청 latency 에 영향을 주지 않도록 한다.
 * - 큐가 가득 차면 CallerRuns 로 폴백 — 트래픽 폭주 시 로그 누락보단 약간 느려지는 쪽 선택.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "eventsExecutor")
    public Executor eventsExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("events-");
        executor.setRejectedExecutionHandler(
                new java.util.concurrent.ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
