import type { UserType } from 'entities/user/model/types/user.type';
import type { ReportReason, ReportStatus, UserStatus } from '../model/types/manager.type';

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '정상',
  SUSPENDED: '정지',
};

export const USER_ROLE_LABEL: Record<UserType, string> = {
  APPLICANT: '구직자',
  EMPLOYER: '고용주',
  MANAGER: '관리자',
};

export const REPORT_STATUS_LABEL: Record<ReportStatus, string> = {
  PENDING: '미처리',
  IN_PROGRESS: '처리중',
  RESOLVED: '처리완료',
};

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  NO_SHOW: '노쇼',
  INAPPROPRIATE_BEHAVIOR: '부적절한 행동',
  FAKE_POST: '허위 공고',
  HARASSMENT: '욕설/비방',
  FRAUD: '사기/허위정보',
  OTHER: '기타',
};

export const formatPercent = (value: number | null | undefined): string => {
  if (value == null) return '-';
  return `${(value * 100).toFixed(2)}%`;
};

export const formatMetric = (value: number | null | undefined, digits = 4): string => {
  if (value == null) return '-';
  return value.toFixed(digits);
};

export const formatDateTime = (value: string | null | undefined): string => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
