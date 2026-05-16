import { useQuery } from '@tanstack/react-query';
import { fetchApplicants, fetchMockApplicants } from 'entities/application/api/application.api';
import type { ApplicantResponse } from '../types/application.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 지원자 목록 조회 훅
 * - mock 모드: mock 데이터 + 실제 API 응답 병합
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useApplicants = (jobPostId: number | null) => {
  return useQuery<ApplicantResponse[]>({
    queryKey: ['applicants', jobPostId],
    queryFn: async () => {
      if (!jobPostId) return [];

      const real = await fetchApplicants(jobPostId)
        .then((res) => res.contents)
        .catch(() => []);

      if (USE_MOCK) {
        const mock = await fetchMockApplicants(jobPostId);
        return [...mock, ...real];
      }

      return real;
    },
    enabled: jobPostId !== null,
  });
};
