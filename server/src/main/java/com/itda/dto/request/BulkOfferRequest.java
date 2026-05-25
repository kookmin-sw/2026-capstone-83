package com.itda.dto.request;

import java.util.List;

public record BulkOfferRequest(
        List<Long> userIds
) {}