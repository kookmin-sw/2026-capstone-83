package com.itda.dto.response;

import com.itda.entity.Report;
import com.itda.enums.ReportReason;
import com.itda.enums.ReportStatus;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        Long reporterUserId,
        String reporterName,
        Long targetUserId,
        String targetName,
        ReportReason reason,
        String detail,
        ReportStatus status,
        String adminNote,
        LocalDateTime createdAt,
        LocalDateTime resolvedAt
) {
    public static ReportResponse from(Report report) {
        return new ReportResponse(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getName(),
                report.getTarget().getId(),
                report.getTarget().getName(),
                report.getReason(),
                report.getDetail(),
                report.getStatus(),
                report.getAdminNote(),
                report.getCreatedAt(),
                report.getResolvedAt()
        );
    }
}
