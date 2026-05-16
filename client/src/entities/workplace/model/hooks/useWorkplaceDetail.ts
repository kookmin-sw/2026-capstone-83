import { useQuery } from '@tanstack/react-query';
import { fetchWorkplaceById, fetchMockWorkplace } from '../../api/workplace.api';
import type { Workplace } from '../types/workplace.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 사업장 상세 조회 훅
 * - mock 모드: 실제 API 실패 시 mock 데이터로 fallback
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useWorkplaceDetail = (id: number | null) => {
  return useQuery<Workplace>({
    queryKey: ['workplace', id],
    queryFn: async () => {
      if (!id) throw new Error('id is required');

      const real = await fetchWorkplaceById(id).catch(() => null);

      if (real) return real;

      if (USE_MOCK) {
        return fetchMockWorkplace(id);
      }

      throw new Error('Workplace not found');
    },
    enabled: id !== null,
  });
};
