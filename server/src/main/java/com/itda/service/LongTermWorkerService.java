package com.itda.service;

import com.itda.entity.LongTermWorker;
import com.itda.entity.User;
import com.itda.entity.Resume;
import com.itda.dto.response.CareerResponse;
import com.itda.dto.response.ResumeCardResponse;
import com.itda.dto.response.ReviewResponse;
import com.itda.enums.ApplicationStatus;
import com.itda.exception.NotFoundException;
import com.itda.repository.LongTermWorkerRepository;
import com.itda.repository.UserRepository;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.CareerRepository;
import com.itda.repository.ResumeRepository;
import com.itda.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LongTermWorkerService {

    private final LongTermWorkerRepository longTermWorkerRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final CareerRepository careerRepository;
    private final ApplicationRepository applicationRepository;
    private final ReviewRepository reviewRepository;

    // 장기근무 토글 (고용주)
    @Transactional
    public boolean toggleLongTermWorker(Long applicantUserId, User employerUser) {
        User applicant = userRepository.findById(applicantUserId)
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다."));

        Optional<LongTermWorker> existing = longTermWorkerRepository
                .findByEmployerUserIdAndApplicantUserId(employerUser.getId(), applicantUserId);

        if (existing.isPresent()) {
            longTermWorkerRepository.delete(existing.get());
            return false; // 장기근무 해제
        }

        longTermWorkerRepository.save(LongTermWorker.builder()
                .employerUser(employerUser)
                .applicantUser(applicant)
                .build());
        return true; // 장기근무 등록
    }

    // 장기근무 여부 확인
    public boolean isLongTermWorker(Long employerUserId, Long applicantUserId) {
        return longTermWorkerRepository
                .existsByEmployerUserIdAndApplicantUserId(employerUserId, applicantUserId);
    }

    // 고용주가 장기근무로 등록한 구직자 ID 목록
    public java.util.List<Long> getLongTermWorkerIds(Long employerUserId) {
        return longTermWorkerRepository.findByEmployerUserId(employerUserId)
                .stream().map(l -> l.getApplicantUser().getId()).toList();
    }

    // 장기근무 등록한 구직자 목록 (ResumeCardResponse)
    public List<ResumeCardResponse> getLongTermWorkers(Long employerUserId) {
        return longTermWorkerRepository.findByEmployerUserId(employerUserId)
                .stream()
                .map(l -> {
                    User resumeUser = l.getApplicantUser();
                    Resume resume = resumeRepository.findByUserId(resumeUser.getId()).orElse(null);
                    List<CareerResponse> careers = resume != null
                            ? careerRepository.findByResumeId(resume.getId())
                              .stream().map(CareerResponse::from).toList()
                            : List.of();
                    int totalHired = applicationRepository
                            .findByApplicantUserIdAndStatus(resumeUser.getId(), ApplicationStatus.HIRED).size();
                    List<ReviewResponse> reviews = reviewRepository
                            .findByReviewerIdAndApplicantUserIdAll(employerUserId, resumeUser.getId())
                            .stream().map(ReviewResponse::from).toList();
                    return ResumeCardResponse.of(resumeUser, resume, careers, totalHired, false, true, reviews);
                })
                .toList();
    }
}