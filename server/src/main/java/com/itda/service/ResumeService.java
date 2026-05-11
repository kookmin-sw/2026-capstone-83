package com.itda.service;

import com.itda.dto.request.CareerRequest;
import com.itda.dto.request.ResumeRequest;
import com.itda.dto.response.CareerResponse;
import com.itda.dto.response.ResumeResponse;
import com.itda.dto.response.ResumeCardResponse;
import com.itda.dto.response.CursorPageResponse;
import com.itda.entity.Career;
import com.itda.entity.Resume;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.exception.NotFoundException;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.CareerRepository;
import com.itda.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final CareerRepository careerRepository;
    private final ApplicationRepository applicationRepository;

    // 이력서 조회
    public ResumeResponse getResume(User user) {
        Resume resume = resumeRepository.findByUserId(user.getId()).orElse(null);

        List<CareerResponse> careers = resume != null
                ? careerRepository.findByResumeId(resume.getId())
                  .stream().map(CareerResponse::from).toList()
                : List.of();

        // 누적 채용 횟수
        int totalHired = applicationRepository
                .findByApplicantUserIdAndStatus(user.getId(), ApplicationStatus.HIRED).size();

        return ResumeResponse.of(user, resume, careers, totalHired);
    }

    // 이력서 등록/수정 (없으면 생성, 있으면 업데이트)
    @Transactional
    public void saveResume(User user, ResumeRequest request) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElse(Resume.builder().user(user).build());

        resumeRepository.save(Resume.builder()
                .id(resume.getId())
                .user(user)
                .education(request.getEducation())
                .educationStatus(request.getEducationStatus())
                .major(request.getMajor())
                .build());
    }

    // 경력 추가
    @Transactional
    public void addCareer(User user, CareerRequest request) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("이력서를 먼저 등록해주세요."));

        careerRepository.save(Career.builder()
                .resume(resume)
                .jobTitle(request.getJobTitle())
                .years(request.getYears())
                .months(request.getMonths())
                .build());
    }

    // 경력 수정
    @Transactional
    public void updateCareer(Long careerId, CareerRequest request) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new NotFoundException("경력을 찾을 수 없습니다."));

        careerRepository.save(Career.builder()
                .id(career.getId())
                .resume(career.getResume())
                .jobTitle(request.getJobTitle())
                .years(request.getYears())
                .months(request.getMonths())
                .build());
    }

    // 경력 삭제
    @Transactional
    public void deleteCareer(Long careerId) {
        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new NotFoundException("경력을 찾을 수 없습니다."));

        careerRepository.delete(career);
    }

    // 인재 목록 조회 (커서 페이지네이션)
    public CursorPageResponse<ResumeCardResponse> getResumeList(Long cursor, int size) {
        Pageable pageable = PageRequest.of(0, size + 1);

        List<Resume> resumes = (cursor == null)
                ? resumeRepository.findAllByOrderByIdAsc(pageable)
                : resumeRepository.findByIdGreaterThanOrderByIdAsc(cursor, pageable);

        boolean hasNext = resumes.size() > size;
        if (hasNext) resumes = resumes.subList(0, size);

        List<ResumeCardResponse> result = resumes.stream().map(resume -> {
            User user = resume.getUser();
            List<CareerResponse> careers = careerRepository.findByResumeId(resume.getId())
                    .stream().map(CareerResponse::from).toList();
            int totalHired = applicationRepository
                    .findByApplicantUserIdAndStatus(user.getId(), ApplicationStatus.HIRED).size();
            return ResumeCardResponse.of(user, resume, careers, totalHired);
        }).toList();

        Long nextCursor = hasNext ? resumes.get(resumes.size() - 1).getId() : null;

        return new CursorPageResponse<>(result, nextCursor, hasNext);
    }
}