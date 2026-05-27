import { authClient } from 'shared/api/httpClient';
import type { CreateReportRequest } from '../model/report.types';

export const createReport = async (body: CreateReportRequest): Promise<void> => {
  await authClient.post('/api/v1/reports', body);
};
