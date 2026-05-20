import type { ApplicationStatus } from 'entities/application/model/types/application.type';
import { getApplicationStatusBadge } from 'entities/application/lib/applicationStatusLabels';
import type { ApplyStatus, PostStatus, WageType } from '../model/types/jobPost.type';
import { APPLICATION_STATUS_MAP, RECRUITMENT_STATUS_MAP } from '../model/constants';

export type DDayTone = 'default' | 'urgent' | 'today' | 'closed';

export const getWageTypeLabel = (wageType: WageType) => {
  if (wageType === 'DAILY') return '일급';
  if (wageType === 'MONTHLY') return '월급';
  return '시급';
};

export const formatScheduleLine = (workDate: string, workStart: string, workEnd: string) =>
  `${workDate} ${workStart}–${workEnd}`;

export const getSlotsRemainingLabel = (total: number, filled: number) => {
  const remaining = Math.max(total - filled, 0);
  if (remaining <= 0) return '모집 완료';
  return `${remaining}자리 남음`;
};

export const getDDayTone = (dDayLabel: string): DDayTone => {
  if (dDayLabel === '마감') return 'closed';
  if (dDayLabel === 'D-Day') return 'today';
  const match = dDayLabel.match(/^D-(\d+)$/);
  if (match && Number(match[1]) <= 3) return 'urgent';
  return 'default';
};

/** 목록에서 표시할 모집 상태 뱃지 (OPEN + 미지원이면 숨김) */
export const getRecruitmentBadge = (status: PostStatus, applyStatus: ApplyStatus) => {
  if (status === 'OPEN' && applyStatus === 'NONE') return null;
  return RECRUITMENT_STATUS_MAP[status];
};

export const getApplicationBadge = (
  applyStatus: ApplyStatus,
  applicationStatus?: ApplicationStatus,
) => {
  if (applicationStatus) return getApplicationStatusBadge(applicationStatus);
  return APPLICATION_STATUS_MAP[applyStatus];
};
