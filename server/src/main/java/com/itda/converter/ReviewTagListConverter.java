package com.itda.converter;

import com.itda.enums.ReviewTag;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * List<ReviewTag> ↔ 콤마 구분 String 변환 컨버터
 * DB: "GOOD_PAY,KIND_EMPLOYER"  ↔  Java: [ReviewTag.GOOD_PAY, ReviewTag.KIND_EMPLOYER]
 */
@Converter
public class ReviewTagListConverter implements AttributeConverter<List<ReviewTag>, String> {

    @Override
    public String convertToDatabaseColumn(List<ReviewTag> tags) {
        if (tags == null || tags.isEmpty()) return null;
        return tags.stream()
                .map(Enum::name)
                .collect(Collectors.joining(","));
    }

    @Override
    public List<ReviewTag> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return Collections.emptyList();
        return Arrays.stream(dbData.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(ReviewTag::valueOf)
                .collect(Collectors.toList());
    }
}
