package com.itda.service;

import com.itda.entity.JobPost;
import com.itda.repository.JobPostRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobPostScheduler {

    private final JobPostRepository jobPostRepository;

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
}
