-- V5: 지역 기반 자동 매칭 필터 추가
--   1) workplaces.district        — 사업장 시/구 단위 행정구역 (예: "서울 강남구")
--   2) worker_availability.preferred_districts — 구직자 희망 지역 목록 (JSON 배열)

ALTER TABLE workplaces
    ADD COLUMN district VARCHAR(50) NOT NULL DEFAULT '' COMMENT '사업장 행정구역 (시/구 단위, 예: 서울 강남구)';

ALTER TABLE worker_availability
    ADD COLUMN preferred_districts TEXT NOT NULL DEFAULT '[]' COMMENT '희망 근무 지역 목록 (JSON 배열, 예: ["서울 강남구","서울 마포구"])';
