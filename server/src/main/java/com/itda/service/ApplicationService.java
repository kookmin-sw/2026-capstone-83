package com.itda.service;

import com.itda.dto.response.ApplicantResponse;
import com.itda.dto.response.ApplicationResponse;
import com.itda.dto.response.CursorPageResponse;
import com.itda.entity.Application;
import com.itda.entity.JobPost;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.enums.InitiatedBy;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.JobPostRepository;
import com.itda.exception.DuplicateException;
import com.itda.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;


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
    @Transactional
    public ApplicantResponse hire(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

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

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.HIRED)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());

        return toApplicantResponse(saved);
    }

    // 고용주 → 거절
    @Transactional
    public ApplicantResponse reject(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.REJECTED)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());

        return toApplicantResponse(saved);
    }

    // 공고별 지원자 목록 (고용주) - 커서 페이지네이션
    public CursorPageResponse<ApplicantResponse> getApplicationsByJobPost(Long jobPostId, Long cursor, int size) {
        int fetchSize = size + 1;
        List<Application> applications = applicationRepository.findByJobPostIdWithCursor(
                jobPostId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = applications.size() > size;
        if (hasNext) {
            applications = applications.subList(0, size);
        }

        List<ApplicantResponse> content = applications.stream()
                .map(this::toApplicantResponse)
                .toList();

        Long nextCursor = hasNext ? applications.get(applications.size() - 1).getId() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }

    // 공고별 근무자 목록 (고용주) - HIRED 상태인 지원자만 조회
    public List<ApplicantResponse> getWorkersByJobPost(Long jobPostId) {
        List<Application> applications = applicationRepository.findByJobPostIdAndStatus(jobPostId, ApplicationStatus.HIRED);
        return applications.stream()
                .map(this::toApplicantResponse)
                .toList();
    }

    // Application → ApplicantResponse 변환 (매칭 횟수 포함)
    private ApplicantResponse toApplicantResponse(Application application) {
        Long userId = application.getApplicantUser().getId();
        long matchCount = applicationRepository.countByApplicantUserIdAndStatusIn(
                userId, List.of(ApplicationStatus.HIRED, ApplicationStatus.COMPLETED));
        return ApplicantResponse.from(application, matchCount);
    }

    // 근무 완료 처리 (고용주)
    @Transactional
    public ApplicantResponse complete(Long applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("지원 내역을 찾을 수 없습니다."));

        Application saved = applicationRepository.save(Application.builder()
                .id(application.getId())
                .jobPost(application.getJobPost())
                .applicantUser(application.getApplicantUser())
                .status(ApplicationStatus.COMPLETED)
                .initiatedBy(application.getInitiatedBy())
                .appliedAt(application.getAppliedAt())
                .build());

        return toApplicantResponse(saved);
    }

    // 내 지원 목록 (지원자) - 커서 페이지네이션 + ApplicationResponse DTO
    public CursorPageResponse<ApplicationResponse> getMyApplications(Long applicantUserId, Long cursor, int size) {
        int fetchSize = size + 1;
        List<Application> applications = applicationRepository.findByApplicantUserIdWithCursor(
                applicantUserId, cursor, PageRequest.of(0, fetchSize));

        boolean hasNext = applications.size() > size;
        if (hasNext) {
            applications = applications.subList(0, size);
        }

        List<ApplicationResponse> content = applications.stream()
                .map(ApplicationResponse::from)
                .toList();

        Long nextCursor = hasNext ? content.get(content.size() - 1).applicationId() : null;
        return CursorPageResponse.of(content, nextCursor, hasNext);
    }
}