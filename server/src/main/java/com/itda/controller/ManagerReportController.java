package com.itda.controller;

import com.itda.dto.request.ReportStatusUpdateRequest;
import com.itda.dto.response.ReportResponse;
import com.itda.enums.ReportStatus;
import com.itda.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/manager/reports")
public class ManagerReportController {

    private final ReportService reportService;

    /**
     * 신고 목록 조회 (상태 필터 + 검색 + 페이지네이션)
     */
    @GetMapping
    public ResponseEntity<Page<ReportResponse>> getReports(
            @RequestParam(required = false) ReportStatus status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reportService.getReports(status, keyword, page, size));
    }

    /**
     * 신고 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ReportResponse> getReport(@PathVariable Long id) {
        return ResponseEntity.ok(reportService.getReport(id));
    }

    /**
     * 신고 상태 변경 (처리중 / 처리완료)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ReportResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody ReportStatusUpdateRequest request) {
        return ResponseEntity.ok(reportService.updateReportStatus(id, request));
    }
}
