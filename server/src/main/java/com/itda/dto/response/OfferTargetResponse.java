package com.itda.dto.response;

public record OfferTargetResponse(
        Long userId,
        String name,
        boolean liked,
        boolean longTerm,
        boolean offered
) {}