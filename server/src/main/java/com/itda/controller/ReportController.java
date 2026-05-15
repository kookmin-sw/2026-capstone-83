package com.itda.controller;

import com.itda.dto.request.ReportRequest;
import com.itda.dto.response.ReportResponse;
import com.itda.entity.User;
import com.itda.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    /**
     * 신고 접수 (구직자/고용주가 호출)
     */
    @PostMapping
    public ResponseEntity<ReportResponse> createReport(
            @AuthenticationPrincipal User user,
            @RequestBody ReportRequest request) {
        return ResponseEntity.status(201).body(reportService.createReport(user, request));
    }
}
