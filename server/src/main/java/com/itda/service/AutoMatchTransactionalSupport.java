package com.itda.service;

import com.itda.entity.Application;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.enums.InitiatedBy;
import com.itda.enums.NotificationType;
import com.itda.exception.NotFoundException;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostRepository;
import com.itda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * 자동 매칭 1건의 트랜잭션 처리 지원 빈.
 *
 * <p>{@link AutoMatchService} 가 {@code this.xxx()} 형태로 호출하면 Spring AOP 프록시를 우회해
 * {@code @Transactional} 이 동작하지 않는다. 이 빈은 그 문제를 해결하기 위해 분리됐으며,
 * {@code REQUIRES_NEW} 전파 설정으로 (구직자, 공고) 한 쌍을 독립 트랜잭션으로 처리한다.
 *
 * <p>한 쌍의 처리가 실패해도 나머지 매칭은 계속 진행된다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AutoMatchTransactionalSupport {

    private final ApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    /**
     * (구직자, 공고) 한 쌍에 대해 Application 생성을 시도한다.
     *
     * <ul>
     *   <li>상태에 관계없이 지원 이력이 한 번이라도 존재하면 <b>스킵</b>한다.
     *       REJECTED(고용주 거절)·CANCELLED(구직자 취소) 포함 — 재지원은 구직자가 수동으로만 가능.</li>
     *   <li>Application 이 성공적으로 생성되면 구직자에게 {@code AUTO_MATCHED},
     *       고용주에게 {@code NEW_APPLICATION} 알림을 각각 발송한다.</li>
     * </ul>
     *
     * @param applicantUserId 구직자 User ID
     * @param jobPostId       대표 JobPost ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void tryCreate(Long applicantUserId, Long jobPostId) {
        // 지원 이력이 한 번이라도 있으면 자동 재매칭하지 않는다.
        // REJECTED/CANCELLED 포함 — 재지원은 구직자가 수동으로만 가능.
        Optional<Application> existing =
                applicationRepository.findByJobPostIdAndApplicantUserId(jobPostId, applicantUserId);
        if (existing.isPresent()) {
            log.debug("[AutoMatch] 스킵 — 지원 이력 존재(status={}): applicantUserId={}, jobPostId={}",
                    existing.get().getStatus(), applicantUserId, jobPostId);
            return;
        }

        User applicant = userRepository.findById(applicantUserId)
                .orElseThrow(() -> new NotFoundException("구직자를 찾을 수 없습니다. id=" + applicantUserId));
        JobPost post = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다. id=" + jobPostId));
        Long employerUserId = post.getWorkplace().getEmployer().getUser().getId();

        applicationRepository.save(Application.builder()
                .jobPost(post)
                .applicantUser(applicant)
                .status(ApplicationStatus.APPLIED)
                .initiatedBy(InitiatedBy.APPLICANT)
                .build());

        notificationService.notify(
                applicantUserId,
                NotificationType.AUTO_MATCHED,
                "[" + post.getTitle() + "] 에 자동 매칭되었습니다.",
                jobPostId);

        notificationService.notify(
                employerUserId,
                NotificationType.NEW_APPLICATION,
                "[" + post.getTitle() + "] 에 새 지원자가 자동 매칭되었습니다.",
                jobPostId);
    }
}
