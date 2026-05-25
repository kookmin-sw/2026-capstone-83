-- =============================================================
-- V2: job_posts 에 그룹 컬럼 추가 (매칭·자정 분할 전용)
-- =============================================================
-- Phase 2 작업: JobPost 에 WorkerAvailability 와 동일한
--   linked_group_id / group_start_at / group_end_at 컬럼 추가.
-- 기존 workDate/workStart/workEnd 는 유지 (표시·필터 용도).

-- ─── 0. 사전 점검 — 자정 넘김 기존 데이터 확인 ──────────────────
-- 아래 쿼리가 0 이 아닌 값을 반환하면 수동 처리 후 진행.
-- 운영 DB 적용 전 반드시 실행:
--   SELECT COUNT(*) FROM job_posts WHERE work_end <= work_start;
-- 0 이면 아래 백필 쿼리 그대로 진행 가능.
-- 0 이 아니면 해당 레코드를 개별 확인하고 담당자에게 보고.

-- ─── 1. 컬럼 추가 (NULL 허용으로 시작 → 백필 후 NOT NULL 전환) ─
ALTER TABLE job_posts
    ADD COLUMN linked_group_id VARCHAR(36) NULL COMMENT '그룹 식별자 UUID (자정 분할 시 두 레코드 공유)',
    ADD COLUMN group_start_at  DATETIME    NULL COMMENT '그룹 전체 시작 일시 (비정규화, 매칭용)',
    ADD COLUMN group_end_at    DATETIME    NULL COMMENT '그룹 전체 종료 일시 (비정규화, 매칭용)';

-- ─── 2. 기존 데이터 백필 ───────────────────────────────────────
-- 전제: work_end > work_start (자정 넘김 없음, 위 0번 쿼리로 확인)
-- UUID() 는 MySQL 기본 제공 함수로, 레코드마다 서로 다른 UUID 를 생성한다.
UPDATE job_posts
SET linked_group_id = UUID(),
    group_start_at  = TIMESTAMP(work_date, work_start),
    group_end_at    = TIMESTAMP(work_date, work_end)
WHERE linked_group_id IS NULL;

-- ─── 3. NOT NULL 제약 전환 ──────────────────────────────────────
ALTER TABLE job_posts
    MODIFY COLUMN linked_group_id VARCHAR(36)  NOT NULL COMMENT '그룹 식별자 UUID',
    MODIFY COLUMN group_start_at  DATETIME     NOT NULL COMMENT '그룹 전체 시작 일시 (비정규화)',
    MODIFY COLUMN group_end_at    DATETIME     NOT NULL COMMENT '그룹 전체 종료 일시 (비정규화)';

-- ─── 4. 인덱스 추가 (매칭 쿼리 성능) ───────────────────────────
CREATE INDEX idx_jobpost_group_range
    ON job_posts (group_start_at, group_end_at);
