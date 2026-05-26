package com.itda.service;

import com.itda.entity.*;
import com.itda.enums.ApplicationStatus;
import com.itda.exception.NotFoundException;
import com.itda.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LikeService {

    private final JobPostLikeRepository jobPostLikeRepository;
    private final ResumeLikeRepository resumeLikeRepository;
    private final JobPostRepository jobPostRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationRepository applicationRepository;

    // 공고 좋아요 토글 (구직자)
    @Transactional
    public boolean toggleJobPostLike(Long jobPostId, User user) {
        Optional<JobPostLike> existing = jobPostLikeRepository
                .findByUserIdAndJobPostId(user.getId(), jobPostId);

        if (existing.isPresent()) {
            jobPostLikeRepository.delete(existing.get());
            return false; // 좋아요 취소
        }

        JobPost jobPost = jobPostRepository.findById(jobPostId)
                .orElseThrow(() -> new NotFoundException("공고를 찾을 수 없습니다."));

        jobPostLikeRepository.save(JobPostLike.builder()
                .user(user)
                .jobPost(jobPost)
                .build());
        return true; // 좋아요 추가
    }

    // 이력서 좋아요 토글 (고용주)
    @Transactional
    public boolean toggleResumeLike(Long resumeId, User employerUser) {

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new NotFoundException("이력서를 찾을 수 없습니다."));

        Optional<ResumeLike> existing = resumeLikeRepository
                .findByEmployerUserIdAndResumeId(employerUser.getId(), resumeId);

        // 이미 좋아요 눌렀으면 취소
        if (existing.isPresent()) {
            resumeLikeRepository.delete(existing.get());
            return false;
        }

        // 좋아요 추가
        resumeLikeRepository.save(ResumeLike.builder()
                .employerUser(employerUser)
                .resume(resume)
                .build());

        return true;
    }

    // 유저가 좋아요한 공고 ID 목록
    public List<Long> getLikedJobPostIds(Long userId) {
        return jobPostLikeRepository.findByUserId(userId)
                .stream().map(l -> l.getJobPost().getId()).toList();
    }

    // 고용주가 좋아요한 이력서 ID 목록
    public List<Long> getLikedResumeIds(Long employerUserId) {
        return resumeLikeRepository.findByEmployerUserId(employerUserId)
                .stream().map(l -> l.getResume().getId()).toList();
    }
}