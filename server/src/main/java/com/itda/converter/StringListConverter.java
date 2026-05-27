package com.itda.converter;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;

/**
 * List<String> <-> JSON String 변환 컨버터
 * DB에는 JSON 문자열로 저장, Java에서는 List<String>으로 사용
 * requirements, benefits, tasks, items 필드에 사용
 */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    // Java List -> DB JSON String
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        // null·빈 리스트를 null 로 저장하면 JSON_CONTAINS(NULL, ...) = NULL → 매칭 불가.
        // '[]' 로 저장해야 JSON 함수가 안전하게 동작한다.
        if (attribute == null || attribute.isEmpty()) return "[]";
        try {
            return objectMapper.writeValueAsString(attribute);
        } catch (Exception e) {
            throw new RuntimeException("List -> JSON 변환 실패", e);
        }
    }

    // DB JSON String -> Java List
    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) return List.of();
        try {
            return objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            throw new RuntimeException("JSON -> List 변환 실패", e);
        }
    }
}