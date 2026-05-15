package com.itda.dto.request;

import com.itda.enums.ReportStatus;

public record ReportStatusUpdateRequest(
        ReportStatus status,
        String adminNote
) {}
