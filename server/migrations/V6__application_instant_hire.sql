-- =============================================================
-- V6: applications 에 instant_hire 플래그 추가
-- =============================================================
-- 장기근무자 / 이력서 좋아요 받은 구직자에게 발송된 오퍼는
-- 구직자 수락 시 OFFERED → HIRED 즉시 전환되는 플로우를 지원한다.
-- 기존 데이터는 모두 false (일반 플로우 유지).

ALTER TABLE applications
ADD COLUMN instant_hire BOOLEAN NOT NULL DEFAULT FALSE
COMMENT '즉시 채용 오퍼 여부 (오퍼 발송 시점 스냅샷)';
