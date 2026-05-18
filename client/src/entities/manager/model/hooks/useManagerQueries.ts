import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateManagerUser,
  fetchDailyMetrics,
  fetchManagerUser,
  fetchMetricsSummary,
  fetchReport,
  searchManagerUsers,
  searchReports,
  suspendManagerUser,
  updateReportStatus,
} from '../../api/manager.api';
import type {
  ManagerUserSearchParams,
  ReportSearchParams,
  ReportStatusUpdateRequest,
  SuspendUserRequest,
} from '../types/manager.type';

export const managerKeys = {
  all: ['manager'] as const,
  users: (params: ManagerUserSearchParams) => [...managerKeys.all, 'users', params] as const,
  user: (id: number) => [...managerKeys.all, 'user', id] as const,
  reports: (params: ReportSearchParams) => [...managerKeys.all, 'reports', params] as const,
  report: (id: number) => [...managerKeys.all, 'report', id] as const,
  metricsSummary: (days: number) => [...managerKeys.all, 'metrics-summary', days] as const,
  metricsDaily: (from: string, to: string) =>
    [...managerKeys.all, 'metrics-daily', from, to] as const,
};

export const useManagerUsers = (params: ManagerUserSearchParams) =>
  useQuery({
    queryKey: managerKeys.users(params),
    queryFn: () => searchManagerUsers(params),
  });

export const useManagerUser = (id: number) =>
  useQuery({
    queryKey: managerKeys.user(id),
    queryFn: () => fetchManagerUser(id),
    enabled: id > 0,
  });

export const useSuspendUser = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SuspendUserRequest) => suspendManagerUser(userId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
    },
  });
};

export const useActivateUser = (userId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => activateManagerUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerKeys.user(userId) });
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
    },
  });
};

export const useManagerReports = (params: ReportSearchParams) =>
  useQuery({
    queryKey: managerKeys.reports(params),
    queryFn: () => searchReports(params),
  });

export const useManagerReport = (id: number) =>
  useQuery({
    queryKey: managerKeys.report(id),
    queryFn: () => fetchReport(id),
    enabled: id > 0,
  });

export const useUpdateReportStatus = (reportId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ReportStatusUpdateRequest) => updateReportStatus(reportId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: managerKeys.report(reportId) });
      queryClient.invalidateQueries({ queryKey: managerKeys.all });
    },
  });
};

export const useMetricsSummary = (days = 30) =>
  useQuery({
    queryKey: managerKeys.metricsSummary(days),
    queryFn: () => fetchMetricsSummary(days),
  });

export const useDailyMetrics = (from: string, to: string, enabled = true) =>
  useQuery({
    queryKey: managerKeys.metricsDaily(from, to),
    queryFn: () => fetchDailyMetrics(from, to),
    enabled: enabled && Boolean(from && to),
  });
