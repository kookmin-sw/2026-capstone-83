import { useQuery } from '@tanstack/react-query';
import { fetchApplications, fetchMockApplications } from 'entities/application/api/application.api';
import type { ApplicationWithJobPost } from '../types/application.type';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 구직자 지원 목록 조회 훅
 * - mock 모드: mock 데이터 + 실제 API 응답 병합
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useApplications = () => {
  return useQuery<ApplicationWithJobPost[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const real = await fetchApplications()
        .then((res) => res.jobPosts as unknown as ApplicationWithJobPost[])
        .catch(() => []);

      if (USE_MOCK) {
        const mock = await fetchMockApplications();
        return [...mock, ...real];
      }

      return real;
    },
  });
};
