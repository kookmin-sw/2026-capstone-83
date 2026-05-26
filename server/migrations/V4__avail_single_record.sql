-- ================================================================
-- V4: WorkerAvailability 단일 레코드 전환
-- date/startTime/endTime/linkedGroupId/groupStartAt/groupEndAt 제거
-- avail_start_at / avail_end_at 추가
-- ================================================================

-- 사전 점검
SELECT 'Step 0: 사전 점검' AS step;

-- 0-1. 분할 그룹 개수 (Day2 제거 대상)
SELECT COUNT(*) AS split_groups FROM (
    SELECT linked_group_id FROM worker_availability
    GROUP BY linked_group_id HAVING COUNT(*) = 2
) t;

-- 0-2. Day2 레코드 샘플 조회 (start_time = 00:00:00 인 레코드)
SELECT id, date, start_time, end_time, linked_group_id
FROM worker_availability
WHERE linked_group_id IN (
    SELECT linked_group_id FROM worker_availability
    GROUP BY linked_group_id HAVING COUNT(*) = 2
)
AND start_time = '00:00:00'
LIMIT 10;

-- ⚠️ 결과 검토 후 진행

START TRANSACTION;

-- Step 1: 새 컬럼 추가
ALTER TABLE worker_availability
    ADD COLUMN avail_start_at DATETIME NULL,
    ADD COLUMN avail_end_at   DATETIME NULL;

-- Step 2: 단일 레코드(분할 없음) 백필
UPDATE worker_availability
SET avail_start_at = group_start_at,
    avail_end_at   = group_end_at
WHERE linked_group_id IN (
    SELECT linked_group_id FROM (
        SELECT linked_group_id FROM worker_availability
        GROUP BY linked_group_id HAVING COUNT(*) = 1
    ) t
);

-- Step 3: 분할 그룹의 Day1 백필 (group_start_at/group_end_at 이 그룹 전체 datetime)
UPDATE worker_availability
SET avail_start_at = group_start_at,
    avail_end_at   = group_end_at
WHERE linked_group_id IN (
    SELECT linked_group_id FROM (
        SELECT linked_group_id FROM worker_availability
        GROUP BY linked_group_id HAVING COUNT(*) = 2
    ) t
)
AND start_time != '00:00:00';  -- Day1 만 (Day2 는 start_time = 00:00:00)

-- Step 4: Day2 삭제
CREATE TEMPORARY TABLE tmp_avail_day2 AS
SELECT id FROM worker_availability
WHERE linked_group_id IN (
    SELECT linked_group_id FROM (
        SELECT linked_group_id FROM worker_availability
        GROUP BY linked_group_id HAVING COUNT(*) = 2
    ) t
)
AND start_time = '00:00:00';

SELECT COUNT(*) AS day2_to_delete FROM tmp_avail_day2;

DELETE FROM worker_availability WHERE id IN (SELECT id FROM tmp_avail_day2);
DROP TEMPORARY TABLE tmp_avail_day2;

-- Step 5: 백필 검증
SELECT COUNT(*) AS unfilled FROM worker_availability
WHERE avail_start_at IS NULL OR avail_end_at IS NULL;
-- 기대: 0

SELECT COUNT(*) AS invalid FROM worker_availability
WHERE avail_end_at <= avail_start_at;
-- 기대: 0

-- Step 6: NOT NULL 제약
ALTER TABLE worker_availability
    MODIFY avail_start_at DATETIME NOT NULL,
    MODIFY avail_end_at   DATETIME NOT NULL;

-- Step 7: 인덱스 교체
CREATE INDEX idx_avail_user_range
    ON worker_availability (user_id, avail_start_at, avail_end_at);

DROP INDEX idx_avail_user_date        ON worker_availability;
DROP INDEX idx_avail_user_group_range ON worker_availability;
DROP INDEX idx_avail_group            ON worker_availability;

-- Step 8: 옛 컬럼 DROP
ALTER TABLE worker_availability
    DROP COLUMN date,
    DROP COLUMN start_time,
    DROP COLUMN end_time,
    DROP COLUMN linked_group_id,
    DROP COLUMN group_start_at,
    DROP COLUMN group_end_at;

-- 최종 확인
DESCRIBE worker_availability;
SHOW INDEX FROM worker_availability;
SELECT COUNT(*) AS total_slots FROM worker_availability;

-- 사용자 확인 후 COMMIT / ROLLBACK
