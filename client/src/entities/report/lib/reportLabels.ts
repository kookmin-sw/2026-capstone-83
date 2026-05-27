import type { ReportReason } from '../model/report.types';

export const REPORT_REASON_LABEL: Record<ReportReason, string> = {
  NO_SHOW: '노쇼',
  INAPPROPRIATE_BEHAVIOR: '부적절한 행동',
  FAKE_POST: '허위 공고',
  HARASSMENT: '욕설/비방',
  FRAUD: '사기/허위정보',
  OTHER: '기타',
};

export const REPORT_REASON_OPTIONS: { value: ReportReason; label: string }[] = (
  Object.entries(REPORT_REASON_LABEL) as [ReportReason, string][]
).map(([value, label]) => ({ value, label }));
