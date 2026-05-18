import type { UserType } from 'entities/user/model/types/user.type';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export type ReportStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

export type ReportReason =
  | 'NO_SHOW'
  | 'INAPPROPRIATE_BEHAVIOR'
  | 'FAKE_POST'
  | 'HARASSMENT'
  | 'FRAUD'
  | 'OTHER';

export interface ManagerUser {
  id: number;
  name: string;
  role: UserType;
  email: string;
  phone: string;
  createdAt: string;
  status: UserStatus;
  suspendedAt: string | null;
  suspendedUntil: string | null;
  suspendReason: string | null;
  reportCount: number;
  matchCount: number;
}

export interface ManagerUserSearchParams {
  keyword?: string;
  role?: UserType;
  status?: UserStatus;
  page?: number;
  size?: number;
}

export interface SuspendUserRequest {
  days: number;
  reason: string;
}

export interface Report {
  id: number;
  reporterUserId: number;
  reporterName: string;
  targetUserId: number;
  targetName: string;
  reason: ReportReason;
  detail: string;
  status: ReportStatus;
  adminNote: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface ReportSearchParams {
  status?: ReportStatus;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface ReportStatusUpdateRequest {
  status: ReportStatus;
  adminNote?: string;
}

export interface MetricsSummary {
  periodDays: number;
  impressions: number;
  clicks: number;
  applications: number;
  ctr: number | null;
  cvrByImpression: number | null;
  cvrByClick: number | null;
  ndcgAt10: number | null;
}

export interface DailyMetrics {
  date: string;
  impressions: number;
  clicks: number;
  applications: number;
  ctr: number | null;
  cvrByImpression: number | null;
  cvrByClick: number | null;
  ndcgAt10: number | null;
}
