import { useQuery } from '@tanstack/react-query';
import { fetchMockApplications } from 'entities/application/api/application.api';
import type { ApplicationWithJobPost } from '../types/application.type';

/**
 * 구직자 지원 목록 mock 조회 (개발용)
 */
export const useMockApplications = () => {
  return useQuery<ApplicationWithJobPost[]>({
    queryKey: ['applications', 'mock'],
    queryFn: fetchMockApplications,
    staleTime: 1000 * 60 * 5,
  });
};
