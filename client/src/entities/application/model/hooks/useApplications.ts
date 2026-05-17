import { useQuery } from '@tanstack/react-query';
import { fetchApplications, fetchMockApplications } from 'entities/application/api/application.api';
import type { ApplicationWithJobPost } from '../types/application.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 구직자 지원 목록 조회 훅
 * 서버가 공고 데이터를 포함해서 내려주므로 추가 요청 불필요
 */
export const useApplications = () => {
  return useQuery<ApplicationWithJobPost[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const real = await fetchApplications()
        .then((res) => res.contents as unknown as ApplicationWithJobPost[])
        .catch(() => []);

      if (USE_MOCK) {
        const mock = await fetchMockApplications();
        return [...mock, ...real];
      }

      return real;
    },
  });
};
