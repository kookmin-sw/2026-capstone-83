import { authClient } from 'shared/api/httpClient';

export const toggleLongTermWorker = async (
  applicantUserId: number,
): Promise<{ longTerm: boolean }> => {
  const response = await authClient.post<{ longTerm: boolean }>(
    `/api/v1/long-term-workers/${applicantUserId}/toggle`,
  );
  return response.data;
};

export const fetchLongTermWorkerStatus = async (
  applicantUserId: number,
): Promise<{ longTerm: boolean }> => {
  const response = await authClient.get<{ longTerm: boolean }>(
    `/api/v1/long-term-workers/${applicantUserId}`,
  );
  return response.data;
};
