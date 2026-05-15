package com.itda.dto.request;

public record SuspendRequest(
        int days,       // 정지 일수 (0이면 영구정지)
        String reason   // 정지 사유
) {}
