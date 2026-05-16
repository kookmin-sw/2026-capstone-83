import { useQuery } from '@tanstack/react-query';
import { fetchUserWorkplaces, fetchMockWorkplaces } from '../api/workplace.api';
import type { Workplace } from '../model/types/workplace.type';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 사업장 목록 조회 훅
 * - mock 모드: mock 데이터 + 실제 API 응답 병합
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useWorkplaces = () => {
  return useQuery<Workplace[]>({
    queryKey: ['workplaces'],
    queryFn: async () => {
      const real = await fetchUserWorkplaces().catch(() => []);

      if (USE_MOCK) {
        const mock = await fetchMockWorkplaces();
        return [...mock, ...real];
      }

      return real;
    },
  });
};
