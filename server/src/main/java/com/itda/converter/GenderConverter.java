package com.itda.converter;

import com.itda.enums.Gender;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Gender enum ↔ DB 문자열 변환.
 * 카카오 가입·초기 데이터 등으로 gender 컬럼에 빈 문자열('')이 들어간 경우
 * {@code @Enumerated(STRING)} 은 500을 유발하므로, 빈 값은 null 로 취급한다.
 */
@Converter
public class GenderConverter implements AttributeConverter<Gender, String> {

    @Override
    public String convertToDatabaseColumn(Gender attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public Gender convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        return Gender.valueOf(dbData.trim());
    }
}
