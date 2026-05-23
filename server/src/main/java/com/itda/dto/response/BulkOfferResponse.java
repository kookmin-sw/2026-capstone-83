package com.itda.dto.response;

public record BulkOfferResponse(
        int offeredCount,
        int skippedCount
) {}