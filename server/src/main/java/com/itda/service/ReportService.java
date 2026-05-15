package com.itda.service;

import com.itda.dto.request.ReportRequest;
import com.itda.dto.request.ReportStatusUpdateRequest;
import com.itda.dto.response.ReportResponse;
import com.itda.entity.Report;
import com.itda.entity.User;
import com.itda.enums.ReportStatus;
import com.itda.exception.NotFoundException;
import com.itda.repository.ReportRepository;
import com.itda.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    /**
     * 신고 접수 (구직자/고용주가 호출)
     */
    @Transactional
    public ReportResponse createReport(User reporter, ReportRequest request) {
        User target = userRepository.findById(request.targetUserId())
                .orElseThrow(() -> new NotFoundException("신고 대상 유저를 찾을 수 없습니다."));

        Report report = Report.builder()
                .reporter(reporter)
                .target(target)
                .reason(request.reason())
                .detail(request.detail())
                .build();

        Report saved = reportRepository.save(report);
        return ReportResponse.from(saved);
    }

    /**
     * 신고 목록 조회 (매니저, 상태 필터 + 검색)
     */
    public Page<ReportResponse> getReports(ReportStatus status, String keyword, int page, int size) {
        Page<Report> reports = reportRepository.searchReports(status, keyword, PageRequest.of(page, size));
        return reports.map(ReportResponse::from);
    }

    /**
     * 신고 상세 조회
     */
    public ReportResponse getReport(Long reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("신고를 찾을 수 없습니다."));
        return ReportResponse.from(report);
    }

    /**
     * 신고 상태 변경 (매니저)
     */
    @Transactional
    public ReportResponse updateReportStatus(Long reportId, ReportStatusUpdateRequest request) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new NotFoundException("신고를 찾을 수 없습니다."));

        report.updateStatus(request.status(), request.adminNote());
        Report saved = reportRepository.save(report);
        return ReportResponse.from(saved);
    }

    /**
     * 특정 유저의 신고 누적 횟수
     */
    public long getReportCount(Long userId) {
        return reportRepository.countByTargetId(userId);
    }
}
