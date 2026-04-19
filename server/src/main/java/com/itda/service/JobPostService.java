package com.itda.service;

import com.itda.entity.JobPost;
import com.itda.enums.JobPostStatus;
import com.itda.repository.JobPostRepository;
import com.itda.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobPostService {

    private final JobPostRepository jobPostRepository;

    // 모집중인 공고 전체 조회
    public List<JobPost> getOpenJobPosts() {
        return jobPostRepository.findByStatus(JobPostStatus.OPEN);
    }

    // 급여 높은 순
    public List<JobPost> getJobPostsOrderByWage() {
        return jobPostRepository.findByStatusOrderByWageDesc(JobPostStatus.OPEN);
    }

    // 마감 임박순
    public List<JobPost> getJobPostsOrderByDeadline() {
        return jobPostRepository.findByStatusOrderByDeadlineAsc(JobPostStatus.OPEN);
    }

    // 키워드 검색
    public List<JobPost> searchJobPosts(String keyword) {
        return jobPostRepository.findByStatusAndTitleContaining(JobPostStatus.OPEN, keyword);
    }

    // 공고 상세 조회
    public JobPost getJobPost(Long id) {
        // 공고 못 찾을 때
        return jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));
    }

    // 고용주 공고 목록
    public List<JobPost> getJobPostsByEmployer(Long employerId) {
        return jobPostRepository.findByEmployerId(employerId);
    }

    // 캘린더용 날짜 범위 조회
    public List<JobPost> getJobPostsByDateRange(Long employerId, LocalDate start, LocalDate end) {
        return jobPostRepository.findByEmployerIdAndWorkDateBetween(employerId, start, end);
    }

    // 공고 등록
    @Transactional
    public JobPost createJobPost(JobPost jobPost) {
        return jobPostRepository.save(jobPost);
    }

    // 공고 마감
    @Transactional
    public void closeJobPost(Long id) {
        // 공고 못 찾을 때
        JobPost jobPost = jobPostRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));
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
                .filledSlots(jobPost.getFilledSlots())
                .status(JobPostStatus.CLOSED)
                .deadline(jobPost.getDeadline())
                .build());
    }

}