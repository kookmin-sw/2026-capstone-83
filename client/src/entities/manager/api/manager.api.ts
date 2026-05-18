import { authClient } from 'shared/api/httpClient';
import type { SpringPage } from 'shared/api/page.types';
import type {
  DailyMetrics,
  ManagerUser,
  ManagerUserSearchParams,
  MetricsSummary,
  Report,
  ReportSearchParams,
  ReportStatusUpdateRequest,
  SuspendUserRequest,
} from '../model/types/manager.type';

export const searchManagerUsers = async (
  params: ManagerUserSearchParams
): Promise<SpringPage<ManagerUser>> => {
  const { data } = await authClient.get<SpringPage<ManagerUser>>('/api/v1/manager/users', {
    params,
  });
  return data;
};

export const fetchManagerUser = async (id: number): Promise<ManagerUser> => {
  const { data } = await authClient.get<ManagerUser>(`/api/v1/manager/users/${id}`);
  return data;
};

export const suspendManagerUser = async (
  id: number,
  body: SuspendUserRequest
): Promise<ManagerUser> => {
  const { data } = await authClient.patch<ManagerUser>(
    `/api/v1/manager/users/${id}/suspend`,
    body
  );
  return data;
};

export const activateManagerUser = async (id: number): Promise<ManagerUser> => {
  const { data } = await authClient.patch<ManagerUser>(
    `/api/v1/manager/users/${id}/activate`
  );
  return data;
};

export const searchReports = async (
  params: ReportSearchParams
): Promise<SpringPage<Report>> => {
  const { data } = await authClient.get<SpringPage<Report>>('/api/v1/manager/reports', {
    params,
  });
  return data;
};

export const fetchReport = async (id: number): Promise<Report> => {
  const { data } = await authClient.get<Report>(`/api/v1/manager/reports/${id}`);
  return data;
};

export const updateReportStatus = async (
  id: number,
  body: ReportStatusUpdateRequest
): Promise<Report> => {
  const { data } = await authClient.patch<Report>(
    `/api/v1/manager/reports/${id}/status`,
    body
  );
  return data;
};

export const fetchMetricsSummary = async (days = 30): Promise<MetricsSummary> => {
  const { data } = await authClient.get<MetricsSummary>(
    '/api/v1/manager/metrics/recommendation/summary',
    { params: { days } }
  );
  return data;
};

export const fetchDailyMetrics = async (
  from: string,
  to: string
): Promise<DailyMetrics[]> => {
  const { data } = await authClient.get<DailyMetrics[]>(
    '/api/v1/manager/metrics/recommendation/daily',
    { params: { from, to } }
  );
  return data;
};
