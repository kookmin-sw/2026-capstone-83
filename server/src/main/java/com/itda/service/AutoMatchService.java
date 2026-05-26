package com.itda.service;

import com.itda.entity.JobPost;
import com.itda.repository.JobPostRepository;
import com.itda.repository.WorkerAvailabilityRepository;
import com.itda.service.event.AutoMatchEvents;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

/**
 * 양방향 자동 매칭 서비스.
 *
 * <p>두 가지 트리거를 처리한다:
 * <ul>
 *   <li><b>가용시간 등록/수정 ({@link #matchForAvailability})</b>:
 *       구직자의 가용시간 범위에 포함되는 OPEN 공고를 찾아 Application 을 자동 생성한다.</li>
 *   <li><b>공고 등록 ({@link #matchForJobPost})</b>:
 *       공고 시간대를 포함하는 가용시간을 가진 구직자를 찾아 Application 을 자동 생성한다.</li>
 * </ul>
 *
 * <p>각 (구직자, 공고) 쌍의 Application 생성은 {@link AutoMatchTransactionalSupport#tryCreate} 에
 * 위임한다. 개별 실패가 전체 매칭을 중단하지 않도록 예외를 warn 로그로 흡수한다.
 *
 * <h3>매칭 조건 (avail ⊇ post)</h3>
 * <ul>
 *   <li>{@code avail.availStartAt ≤ post.workStartAt}: 가용시간이 공고 시작 전에 시작</li>
 *   <li>{@code avail.availEndAt ≥ post.workEndAt}: 가용시간이 공고 종료 이후까지 연장</li>
 *   <li>{@code avail.minDurationMinutes ≤ postDurationMinutes}: 공고 길이가 최소 근무 요건 충족</li>
 *   <li>고용주 본인 공고 / 본인 가용시간 제외</li>
 * </ul>
 *
 * <h3>생성 불가 케이스 (AutoMatchTransactionalSupport 에서 처리)</h3>
 * <ul>
 *   <li>활성 지원(APPLIED/OFFERED/PENDING/HIRED)이 이미 존재하면 스킵</li>
 *   <li>REJECTED/CANCELLED 만 있으면 재매칭 허용</li>
 *   <li>절대로 HIRED 상태로 자동 생성하지 않는다 — 항상 APPLIED + APPLICANT</li>
 * </ul>
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AutoMatchService {

    private final JobPostRepository jobPostRepository;
    private final WorkerAvailabilityRepository availabilityRepository;
    private final AutoMatchTransactionalSupport txSupport;

    // ─── 트리거 A: 가용시간 등록/수정 ────────────────────────────

    /**
     * 구직자 가용시간 등록/수정 이벤트에 대한 자동 매칭.
     *
     * <p>가용시간 범위 [availStartAt, availEndAt] 에 완전히 포함되는 OPEN 공고를 탐색하고,
     * 공고 근무 시간이 {@code minDurationMinutes} 이상이면 Application 생성을 시도한다.
     */
    public void matchForAvailability(AutoMatchEvents.AvailabilityCreatedEvent event) {
        List<Long> postIds = jobPostRepository.findMatchingJobPostIdsForAvailability(
                event.availStartAt(), event.availEndAt(), event.userId());

        if (postIds.isEmpty()) return;

        // 배치 조회로 N+1 방지
        List<JobPost> posts = jobPostRepository.findAllById(postIds);
        for (JobPost jobPost : posts) {
            // 공고 근무 시간(분) < 구직자 최소 요구 시간 → 스킵
            int postDurationMinutes = (int) Duration.between(
                    jobPost.getWorkStartAt(), jobPost.getWorkEndAt()).toMinutes();
            if (postDurationMinutes < event.minDurationMinutes()) {
                log.debug("[AutoMatch] 최소 근무 시간 미달 스킵 — post={}min, required={}min, jobPostId={}",
                        postDurationMinutes, event.minDurationMinutes(), jobPost.getId());
                continue;
            }

            try {
                txSupport.tryCreate(event.userId(), jobPost.getId());
            } catch (Exception e) {
                log.warn("[AutoMatch] availabilityEvent 매칭 실패 — userId={}, jobPostId={}, err={}",
                        event.userId(), jobPost.getId(), e.getMessage());
            }
        }
    }

    // ─── 트리거 B: 공고 등록 ─────────────────────────────────────

    /**
     * 구인 공고 등록 이벤트에 대한 자동 매칭.
     *
     * <p>공고 시간대 [workStartAt, workEndAt] 를 완전히 포함하는 가용시간을 가진 구직자를
     * 탐색하고, 각 구직자에 대해 Application 생성을 시도한다.
     */
    public void matchForJobPost(AutoMatchEvents.JobPostCreatedEvent event) {
        int postDurationMinutes = (int) Duration.between(
                event.workStartAt(), event.workEndAt()).toMinutes();

        List<Long> applicantUserIds = availabilityRepository.findMatchingUserIdsForJobPost(
                event.workStartAt(), event.workEndAt(),
                postDurationMinutes, event.employerUserId());

        if (applicantUserIds.isEmpty()) return;

        for (Long applicantUserId : applicantUserIds) {
            try {
                txSupport.tryCreate(applicantUserId, event.jobPostId());
            } catch (Exception e) {
                log.warn("[AutoMatch] jobPostEvent 매칭 실패 — applicantUserId={}, jobPostId={}, err={}",
                        applicantUserId, event.jobPostId(), e.getMessage());
            }
        }
    }
}
