package com.itda.service;
import com.itda.dto.request.CareerRequest;
import com.itda.dto.request.CertificateRequest;
import com.itda.dto.request.ResumeRequest;
import com.itda.dto.response.CareerResponse;
import com.itda.dto.response.CertificateResponse;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.ResumeCardResponse;
import com.itda.dto.response.ResumeResponse;
import com.itda.entity.Career;
import com.itda.entity.Certificate;
import com.itda.entity.Resume;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.exception.NotFoundException;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.CareerRepository;
import com.itda.repository.CertificateRepository;
import com.itda.repository.ResumeRepository;
import com.itda.repository.ResumeLikeRepository;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final CareerRepository careerRepository;
    private final CertificateRepository certificateRepository;
    private final ApplicationRepository applicationRepository;
    private final LikeService likeService;
    private final ResumeLikeRepository resumeLikeRepository;
    private final S3Service s3Service;

    // 본인 이력서 조회
    public ResumeResponse getResume(User user) {
        Resume resume = resumeRepository.findByUserId(user.getId()).orElse(null);

        List<CareerResponse> careers = resume != null
                ? careerRepository.findByResumeId(resume.getId())
                  .stream().map(CareerResponse::from).toList()
                : List.of();

        List<CertificateResponse> certificates = resume != null
                ? certificateRepository.findByResumeId(resume.getId())
                  .stream().map(CertificateResponse::from).toList()
                : List.of();

        int totalHired = applicationRepository
                .findByApplicantUserIdAndStatus(user.getId(), ApplicationStatus.HIRED).size();

        return ResumeResponse.of(user, resume, careers, certificates, totalHired, false);
    }

    // 이력서 상세 조회 (고용주용 - liked 포함)
    public ResumeResponse getResumeDetail(Long resumeId, User viewer) {
        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new NotFoundException("이력서를 찾을 수 없습니다."));

        User resumeUser = resume.getUser();

        List<CareerResponse> careers = careerRepository.findByResumeId(resume.getId())
                .stream().map(CareerResponse::from).toList();

        List<CertificateResponse> certificates = certificateRepository.findByResumeId(resume.getId())
                .stream().map(CertificateResponse::from).toList();

        int totalHired = applicationRepository
                .findByApplicantUserIdAndStatus(resumeUser.getId(), ApplicationStatus.HIRED).size();

        // 좋아요 여부 확인
        boolean liked = (viewer != null)
                && resumeLikeRepository.existsByEmployerUserIdAndResumeId(viewer.getId(), resume.getId());

        return ResumeResponse.of(resumeUser, resume, careers, certificates, totalHired, liked);
    }

    // 이력서 증명사진 등록/수정
    @Transactional
    public void updateResumePhoto(User user, MultipartFile photo) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("이력서를 먼저 등록해주세요."));

        // 기존 사진이 있으면 S3에서 삭제
        if (resume.getPhotoUrl() != null) {
            s3Service.delete(resume.getPhotoUrl());
        }

        String photoUrl = s3Service.upload(photo, "resume/photos/" + user.getId());

        Resume updated = Resume.builder()
                .id(resume.getId())
                .user(resume.getUser())
                .education(resume.getEducation())
                .educationStatus(resume.getEducationStatus())
                .major(resume.getMajor())
                .photoUrl(photoUrl)
                .createdAt(resume.getCreatedAt())
                .build();

        resumeRepository.save(updated);
    }

    // 이력서 증명사진 삭제
    @Transactional
    public void deleteResumePhoto(User user) {
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("이력서를 찾을 수 없습니다."));

        if (resume.getPhotoUrl() == null) {
            throw new IllegalStateException("등록된 증명사진이 없습니다.");
        }

        // S3에서 사진 삭제
        s3Service.delete(resume.getPhotoUrl());

        Resume updated = Resume.builder()
                .id(resume.getId())
                .user(resume.getUser())
                .education(resume.getEducation())
                .educationStatus(resume.getEducationStatus())
                .major(resume.getMajor())
                .photoUrl(null)
                .createdAt(resume.getCreatedAt())
                .build();

        resumeRepository.save(updated);
    }

    // 이력서 등록/수정
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

    // 자격/인증 추가
    @Transactional
    public void addCertificate(User user, CertificateRequest request) {
        // 이력서 없으면 예외
        Resume resume = resumeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new NotFoundException("이력서를 먼저 등록해주세요."));

        certificateRepository.save(Certificate.builder()
                .resume(resume)
                .type(request.getType())
                .imageUrl(null) // 이미지는 별도 업로드 API로 처리
                .build());
    }

    // 자격/인증 삭제 (소유권 검증 포함)
    @Transactional
    public void deleteCertificate(Long certificateId, User user) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new NotFoundException("자격/인증을 찾을 수 없습니다."));

        // 본인 이력서의 자격/인증인지 검증
        if (!certificate.getResume().getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("본인의 자격/인증만 삭제할 수 있습니다.");
        }

        certificateRepository.delete(certificate);
    }

    // 인재 목록 조회 (커서 페이지네이션)
    public CursorPageResponse<ResumeCardResponse> getResumeList(Long cursor, int size, User user) {
        Pageable pageable = PageRequest.of(0, size + 1);

        List<Resume> resumes = (cursor == null)
                ? resumeRepository.findAllByOrderByIdAsc(pageable)
                : resumeRepository.findByIdGreaterThanOrderByIdAsc(cursor, pageable);

        boolean hasNext = resumes.size() > size;
        if (hasNext) resumes = resumes.subList(0, size);

        List<Long> likedIds = (user != null)
                ? likeService.getLikedResumeIds(user.getId())
                : List.of();

        List<ResumeCardResponse> result = resumes.stream()
                .map(resume -> {
                    User resumeUser = resume.getUser();
                    List<CareerResponse> careers = careerRepository.findByResumeId(resume.getId())
                            .stream().map(CareerResponse::from).toList();
                    int totalHired = applicationRepository
                            .findByApplicantUserIdAndStatus(resumeUser.getId(), ApplicationStatus.HIRED).size();
                    return ResumeCardResponse.of(resumeUser, resume, careers, totalHired, likedIds.contains(resume.getId()));
                })
                .toList();

        Long nextCursor = hasNext ? resumes.get(resumes.size() - 1).getId() : null;

        return new CursorPageResponse<>(result, nextCursor, hasNext);
    }
}