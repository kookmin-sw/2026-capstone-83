package com.itda.service;

import com.itda.entity.Application;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.enums.InitiatedBy;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostRepository;
import com.itda.exception.DuplicateException;
import com.itda.exception.NotFoundException;
import com.itda.dto.response.ScheduleResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.TreeMap;
import java.time.LocalDate;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobPostRepository jobPostRepository;

    // 지원자 → 공고 지원
    @Transactional
    public Application apply(Long jobPostId, User applicant) {
        applicationRepository.findByJobPostIdAndApplicantUserId(jobPostId, applicant.getId())
                .ifPresent(a -> { throw new DuplicateException("이미 지원한 공고입니다."); });

        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        Application application = Application.builder()
                .jobPost(jobPost)
                .applicantUser(applicant)
                .status(ApplicationStatus.APPLIED)
                .initiatedBy(InitiatedBy.APPLICANT)
                .build();

        return applicationRepository.save(application);
    }

    // 고용주 → 지원자에게 제안
    @Transactional
    public Application offer(Long jobPostId, User applicant) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        Application application = Application.builder()
                .jobPost(jobPost)
                .applicantUser(applicant)
                .status(ApplicationStatus.OFFERED)
                .initiatedBy(InitiatedBy.EMPLOYER)
                .build();

        return applicationRepository.save(application);
    }

    // 고용주 → 채용 확정
    // 채용 확정 - 소유권 검증
    @Transactional
    public Application hire(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        if (!application.getJobPost().getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 처리할 수 있습니다.");
        }

        // 기존 hire 로직 동일
        JobPost jobPost = application.getJobPost();
        jobPostRepository.save(JobPost.builder()
                .id(jobPost.getId())
                .workplace(jobPost.getWorkplace())
                .title(jobPost.getTitle())
                .s3ContentUrl(jobPost.getS3ContentUrl())
                .wage(jobPost.getWage())
                .wageType(jobPost.getWageType())
                .workDate(jobPost.getWorkDate())
                .workStart(jobPost.getWorkStart())
                .workEnd(jobPost.getWorkEnd())
                .totalSlots(jobPost.getTotalSlots())
                .filledSlots(jobPost.getFilledSlots() + 1)
                .status(jobPost.getStatus())
                .deadline(jobPost.getDeadline())
                .build());

        return applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.HIRED)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());
    }

    // 고용주 → 거절
    @Transactional
    public Application reject(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        if (!application.getJobPost().getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 처리할 수 있습니다.");
        }

        return applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.REJECTED)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());
    }
    @Transactional
    public Application acceptOffer(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        if (application.getStatus() != ApplicationStatus.OFFERED) {
            throw new IllegalStateException("제안 상태가 아닙니다.");
        }

        return applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.PENDING)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());
    }

    // 공고별 지원자 목록 (고용주) - 소유권 검증
    public List<Application> getApplicationsByJobPost(Long jobPostId, Long userId) {
        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        if (!jobPost.getWorkplace().getEmployer().getUser().getId().equals(userId)) {
            throw new IllegalStateException("본인의 공고만 조회할 수 있습니다.");
        }

        return applicationRepository.findByJobPostId(jobPostId);
    }

    // 지원 여부 확인 (구직자)
    public boolean hasApplied(Long jobPostId, Long applicantUserId) {
        return applicationRepository
                .findByJobPostIdAndApplicantUserId(jobPostId, applicantUserId)
                .isPresent();
    }
    // 내 지원 목록 (지원자) - status 필터 선택적
    public List<Application> getMyApplications(Long applicantUserId, ApplicationStatus status) {
        if (status != null) {
            return applicationRepository.findByApplicantUserIdAndStatus(applicantUserId, status);
        }
        return applicationRepository.findByApplicantUserId(applicantUserId);
    }

    // 내 지원 목록 (지원자) - status 필터 선택적
    public Map<String, List<ScheduleResponse>> getMySchedule(Long applicantUserId, LocalDate fromDate, LocalDate toDate) {
        List<Application> applications = applicationRepository
                .findByApplicantUserIdAndStatusAndJobPost_WorkDateBetween(
                        applicantUserId, ApplicationStatus.HIRED, fromDate, toDate);

        return applications.stream()
                .collect(Collectors.groupingBy(
                        a -> a.getJobPost().getWorkDate().toString(),
                        TreeMap::new,
                        Collectors.mapping(ScheduleResponse::from, Collectors.toList())
                ));
    }
}