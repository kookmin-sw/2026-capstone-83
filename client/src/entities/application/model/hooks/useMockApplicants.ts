import { useQuery } from '@tanstack/react-query';
import { fetchMockApplicants } from 'entities/application/api/application.api';
import type { ApplicantResponse } from '../types/application.type';

/**
 * 지원자 목록 mock 조회 (개발용)
 */
export const useMockApplicants = (jobPostId: number | null) => {
  return useQuery<ApplicantResponse[]>({
    queryKey: ['applicants', 'mock', jobPostId],
    queryFn: () => fetchMockApplicants(jobPostId!),
    enabled: jobPostId !== null,
    staleTime: 1000 * 60 * 5,
  });
};
