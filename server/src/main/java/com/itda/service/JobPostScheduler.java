package com.itda.service;

import com.itda.entity.Application;
import com.itda.entity.JobPost;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobPostScheduler {

    private final JobPostRepository jobPostRepository;
    private final ApplicationRepository applicationRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void closeExpiredJobPosts() {
        List<JobPost> expired = jobPostRepository.findExpiredOpenPosts(LocalDate.now());

        if (expired.isEmpty()) {
            return;
        }

        expired.forEach(JobPost::closeByExpiry);
        jobPostRepository.saveAll(expired);

        log.info("[스케줄러] 기간 만료 공고 {}건 자동 마감 처리 ({})",
                expired.size(), LocalDate.now());
    }

    /**
     * 근무 완료 자동 처리
     * 매시 정각 실행 — 당일 근무 종료 시각이 지난 HIRED Application을 COMPLETED로 전환
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void completeFinishedWork() {
        List<Application> targets = applicationRepository.findCompletableApplications(
                LocalDate.now(), LocalTime.now());

        if (targets.isEmpty()) return;

        targets.forEach(Application::completeWork);
        applicationRepository.saveAll(targets);

        log.info("[스케줄러] 근무 완료 자동 처리 {}건 ({})",
                targets.size(), LocalDateTime.now());
    }

    /**
     * 근무 시작 시간 기준 공고 마감
     * 매시 정각 실행 — 당일 workStart가 지난 OPEN 공고를 CLOSED로 전환
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void closeStartedJobPosts() {
        List<JobPost> started = jobPostRepository.findStartedOpenPosts(
                LocalDate.now(), LocalTime.now());

        if (started.isEmpty()) return;

        started.forEach(JobPost::closeByExpiry);
        jobPostRepository.saveAll(started);

        log.info("[스케줄러] 근무 시작 공고 {}건 자동 마감 ({})",
                started.size(), LocalDateTime.now());
    }
}
