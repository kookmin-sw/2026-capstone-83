import { useQuery } from '@tanstack/react-query';
import { fetchResume, fetchMockResume } from '../api/resume.api';
import type { ResumeResponse } from '../model/types/resume.type';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 이력서 상세 조회 훅
 * - mock 모드: 실제 API 실패 시 mock 데이터로 fallback
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useResumeDetail = (resumeId?: number) => {
  return useQuery<ResumeResponse>({
    queryKey: ['resume', resumeId],
    queryFn: async () => {
      const real = await fetchResume().catch(() => null);

      if (real) return real;

      if (USE_MOCK && resumeId) {
        return fetchMockResume(resumeId);
      }

      throw new Error('Resume not found');
    },
    enabled: resumeId !== undefined,
  });
};
