import { useQuery } from '@tanstack/react-query';
import { fetchResumeDetail, fetchMockResume } from '../../api/resume.api';
import type { ResumeResponse } from '../types/resume.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 이력서 상세 조회 — GET /api/v1/resume/{resumeId}
 */
export const useResumeDetail = (resumeId?: number, enabled = true) => {
  return useQuery<ResumeResponse>({
    queryKey: ['resume', 'detail', resumeId],
    queryFn: async () => {
      if (resumeId == null) throw new Error('Resume id is required');

      try {
        return await fetchResumeDetail(resumeId);
      } catch {
        if (USE_MOCK) {
          return fetchMockResume(resumeId);
        }
        throw new Error('Resume not found');
      }
    },
    enabled: enabled && resumeId != null,
  });
};
