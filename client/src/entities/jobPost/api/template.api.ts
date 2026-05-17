import { authClient } from 'shared/api/httpClient';
import type { JobPostTemplateRequest, JobPostTemplateResponse } from '../model/types/template.type';

/** 내 템플릿 목록 조회 */
export const fetchTemplates = async (): Promise<JobPostTemplateResponse[]> => {
  const response = await authClient.get<JobPostTemplateResponse[]>('/api/v1/templates');
  return response.data;
};

/** 템플릿 상세 조회 */
export const fetchTemplate = async (id: number): Promise<JobPostTemplateResponse> => {
  const response = await authClient.get<JobPostTemplateResponse>(`/api/v1/templates/${id}`);
  return response.data;
};

/** 템플릿 생성 */
export const createTemplate = async (data: JobPostTemplateRequest): Promise<JobPostTemplateResponse> => {
  const response = await authClient.post<JobPostTemplateResponse>('/api/v1/templates', data);
  return response.data;
};

/** 템플릿 수정 */
export const updateTemplate = async (id: number, data: JobPostTemplateRequest): Promise<JobPostTemplateResponse> => {
  const response = await authClient.put<JobPostTemplateResponse>(`/api/v1/templates/${id}`, data);
  return response.data;
};

/** 템플릿 삭제 */
export const deleteTemplate = async (id: number): Promise<void> => {
  await authClient.delete(`/api/v1/templates/${id}`);
};
