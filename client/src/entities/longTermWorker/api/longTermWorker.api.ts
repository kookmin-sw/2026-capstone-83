import { authClient } from 'shared/api/httpClient';
import type { ResumeCardItem } from 'entities/resume/model/types/resume.type';

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

/** 장기근무로 등록한 구직자 목록 (이력서 카드) */
export const fetchLongTermWorkers = async (): Promise<ResumeCardItem[]> => {
  const response = await authClient.get<ResumeCardItem[]>('/api/v1/long-term-workers');
  return response.data;
};
