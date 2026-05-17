import type { BadgeScheme } from "shared/types/theme";
import type { ApplyStatus, PostStatus } from "./types/jobPost.type";

export const PAGE_SIZE = 12; // 페이지당 공고 수
export const SECTION_SIZE = 6; // 메인 섹션 미리보기 수

interface StatusInfo {
  label: string;
  scheme: BadgeScheme;
}


export const RECRUITMENT_STATUS_MAP = {
  OPEN: { label: '모집 중', scheme: 'primary' },
  CLOSED: { label: '마감', scheme: 'success' },
  CANCELLED: { label: '취소', scheme: 'error' },
} as const satisfies Record<PostStatus, StatusInfo>;

export const APPLICATION_STATUS_MAP = {
  NONE: null, // 지원 안 함 (표시 안 함)
  APPLYING: { label: '지원 중', scheme: 'neutral' },
  SELECTED: { label: '승인 대기', scheme: 'secondary' },
  HIRED: { label: '채용 확정', scheme: 'success' },
  REJECTED: { label: '지원 종료', scheme: 'error' },
} as const satisfies Record<ApplyStatus, StatusInfo | null>;