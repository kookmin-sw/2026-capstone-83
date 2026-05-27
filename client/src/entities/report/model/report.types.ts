/** POST /api/v1/reports — 서버 ReportReason 과 동일 */
export type ReportReason =
  | 'NO_SHOW'
  | 'INAPPROPRIATE_BEHAVIOR'
  | 'FAKE_POST'
  | 'HARASSMENT'
  | 'FRAUD'
  | 'OTHER';

export interface CreateReportRequest {
  targetUserId: number;
  reason: ReportReason;
  detail?: string;
}
