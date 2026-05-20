import type { BadgeScheme } from 'shared/types/theme';
import type { ApplicationStatus } from '../model/types/application.type';

/**
 * 지원 상태 한글 라벨 (API status enum 키는 영문 유지)
 * 서버 주석: APPLIED=지원중, PENDING=채용 대기중, HIRED=확정된 근무
 */
export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  APPLIED: '지원 중',
  OFFERED: '채용 제안',
  PENDING: '채용 대기',
  HIRED: '채용 확정',
  REJECTED: '거절',
  COMPLETED: '근무 완료',
  CANCELLED: '지원 취소',
};

/** 고용주 지원자 목록 등 섹션용 뱃지 색 */
export const APPLICATION_STATUS_BADGE_SCHEME: Record<ApplicationStatus, BadgeScheme> = {
  APPLIED: 'primary',
  OFFERED: 'secondary',
  PENDING: 'neutral',
  HIRED: 'success',
  REJECTED: 'error',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

/** 목록·캘린더 뱃지 (null이면 미표시) */
export const isApplicationStatus = (value: string): value is ApplicationStatus =>
  value in APPLICATION_STATUS_LABEL;

export const getApplicationStatusBadge = (status: ApplicationStatus | string | undefined) => {
  if (!status || !isApplicationStatus(status)) return null;
  return {
    label: APPLICATION_STATUS_LABEL[status],
    scheme: APPLICATION_STATUS_BADGE_SCHEME[status],
  };
};

/** 고용주 대시보드 기본 노출 순서 */
export const EMPLOYER_APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'APPLIED',
  'OFFERED',
  'PENDING',
  'HIRED',
  'REJECTED',
  'COMPLETED',
  'CANCELLED',
];

/** 구직자 지원 이력 기본 노출 순서 */
export const WORKER_APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  'APPLIED',
  'OFFERED',
  'PENDING',
  'HIRED',
  'REJECTED',
];
