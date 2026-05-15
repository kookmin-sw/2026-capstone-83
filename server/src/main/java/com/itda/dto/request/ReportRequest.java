package com.itda.dto.request;

import com.itda.enums.ReportReason;

public record ReportRequest(
        Long targetUserId,
        ReportReason reason,
        String detail
) {}
