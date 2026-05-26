-- ============================================================
-- V3: JobPost 단일 레코드 전환
-- - work_start_at, work_end_at 추가 + 백필
-- - linked_group_id, group_start_at, group_end_at 제거
-- - 자정 분할로 저장된 기존 Day2 레코드 정리
-- ============================================================

-- ─── Step 0: 사전 점검 ────────────────────────────────────────

SELECT 'Step 0: 사전 점검' AS step;

-- 0-1. linked_group_id 가 2개 행을 가진 분할 그룹 개수
SELECT COUNT(*) AS split_groups
FROM (
    SELECT linked_group_id FROM job_posts
    WHERE linked_group_id IS NOT NULL
    GROUP BY linked_group_id
    HAVING COUNT(*) = 2
) t;

-- 0-2. 분할 그룹의 Day2 레코드 (제거 대상)
SELECT id, title, work_date, work_start, work_end, linked_group_id
FROM job_posts jp1
WHERE jp1.linked_group_id IN (
    SELECT linked_group_id FROM job_posts
    GROUP BY linked_group_id HAVING COUNT(*) = 2
)
AND jp1.work_date > (
    SELECT MIN(work_date) FROM job_posts jp2
    WHERE jp2.linked_group_id = jp1.linked_group_id
);

-- 0-3. Day2 레코드에 종속 데이터 (applications, likes) 가 있는지 확인
--      결과가 0이 아니면 즉시 중단하고 담당자에게 보고
SELECT
    (SELECT COUNT(*) FROM applications a WHERE a.job_post_id IN (
        SELECT jp1.id FROM job_posts jp1
        WHERE jp1.linked_group_id IN (
            SELECT linked_group_id FROM job_posts GROUP BY linked_group_id HAVING COUNT(*) = 2
        )
        AND jp1.work_date > (
            SELECT MIN(work_date) FROM job_posts jp2
            WHERE jp2.linked_group_id = jp1.linked_group_id
        )
    )) AS day2_applications,
    (SELECT COUNT(*) FROM job_post_likes WHERE job_post_id IN (
        SELECT jp1.id FROM job_posts jp1
        WHERE jp1.linked_group_id IN (
            SELECT linked_group_id FROM job_posts GROUP BY linked_group_id HAVING COUNT(*) = 2
        )
        AND jp1.work_date > (
            SELECT MIN(work_date) FROM job_posts jp2
            WHERE jp2.linked_group_id = jp1.linked_group_id
        )
    )) AS day2_likes;

-- ⚠️ 위 결과를 검토한 뒤 아래 트랜잭션을 진행할 것.
-- day2_applications / day2_likes 모두 0 이어야 정상 진행 가능.

-- ─── 본 마이그레이션 ──────────────────────────────────────────

START TRANSACTION;

-- Step 1: 새 컬럼 추가 (NULL 허용으로 시작)
SELECT 'Step 1: 컬럼 추가' AS step;
ALTER TABLE job_posts
    ADD COLUMN work_start_at DATETIME NULL COMMENT '근무 시작 일시 (매칭 전용)',
    ADD COLUMN work_end_at   DATETIME NULL COMMENT '근무 종료 일시 (매칭 전용, 항상 work_start_at 보다 큼)';

-- Step 2: 백필
-- 분할 안 된 단일 레코드 + 분할 그룹의 Day1 레코드만 백필
-- (Day2 는 Step 3에서 삭제 예정이므로 백필 불필요)
SELECT 'Step 2: 백필' AS step;
UPDATE job_posts
SET work_start_at = TIMESTAMP(work_date, work_start),
    work_end_at   = CASE
        WHEN work_end <= work_start
            THEN TIMESTAMP(DATE_ADD(work_date, INTERVAL 1 DAY), work_end)
        ELSE TIMESTAMP(work_date, work_end)
    END
WHERE linked_group_id IS NULL
   OR linked_group_id IN (
       SELECT linked_group_id FROM (
           SELECT linked_group_id FROM job_posts GROUP BY linked_group_id HAVING COUNT(*) = 1
       ) single_t
   )
   OR (linked_group_id IS NOT NULL AND work_date = (
       SELECT MIN(work_date) FROM job_posts jp2
       WHERE jp2.linked_group_id = job_posts.linked_group_id
   ));

-- Step 3: 분할 그룹의 Day2 레코드 삭제
-- (Step 0-3 에서 종속 데이터 0건 확인 전제)
SELECT 'Step 3: Day2 레코드 삭제' AS step;
CREATE TEMPORARY TABLE tmp_day2_ids AS
    SELECT jp1.id
    FROM job_posts jp1
    WHERE jp1.linked_group_id IN (
        SELECT linked_group_id FROM job_posts
        GROUP BY linked_group_id HAVING COUNT(*) = 2
    )
    AND jp1.work_date > (
        SELECT MIN(work_date) FROM job_posts jp2
        WHERE jp2.linked_group_id = jp1.linked_group_id
    );

DELETE FROM job_posts WHERE id IN (SELECT id FROM tmp_day2_ids);
DROP TEMPORARY TABLE tmp_day2_ids;

-- Step 4: 백필 검증
SELECT 'Step 4: 검증' AS step;
SELECT COUNT(*) AS unfilled FROM job_posts WHERE work_start_at IS NULL OR work_end_at IS NULL;
-- 기대: 0

SELECT COUNT(*) AS invalid_range FROM job_posts WHERE work_end_at <= work_start_at;
-- 기대: 0

-- Step 5: NOT NULL 제약 전환
SELECT 'Step 5: NOT NULL 전환' AS step;
ALTER TABLE job_posts
    MODIFY COLUMN work_start_at DATETIME NOT NULL COMMENT '근무 시작 일시 (매칭 전용)',
    MODIFY COLUMN work_end_at   DATETIME NOT NULL COMMENT '근무 종료 일시 (매칭 전용, 항상 work_start_at 보다 큼)';

-- Step 6: 신규 인덱스 추가 + 구 인덱스 제거
SELECT 'Step 6: 인덱스 교체' AS step;
CREATE INDEX idx_jobpost_work_range ON job_posts (work_start_at, work_end_at);
DROP INDEX idx_jobpost_group_range ON job_posts;

-- Step 7: 구 컬럼 제거
SELECT 'Step 7: 구 컬럼 제거' AS step;
ALTER TABLE job_posts
    DROP COLUMN linked_group_id,
    DROP COLUMN group_start_at,
    DROP COLUMN group_end_at;

-- 최종 검증
SELECT 'V3 완료 검증' AS step;
SELECT COUNT(*) AS total_posts FROM job_posts;

-- ⚠️ 위 결과 확인 후 COMMIT 또는 ROLLBACK
-- 절대 자동 COMMIT 금지 — 운영자가 직접 확인 후 결정
-- COMMIT;
-- ROLLBACK;
