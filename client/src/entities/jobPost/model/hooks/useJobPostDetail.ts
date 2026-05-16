import { useQuery } from '@tanstack/react-query';
import { fetchJobPost, fetchMockJobPost } from '../../api/jobPost.api';
import type { JobPostDetail } from '../types/jobPost.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 공고 상세 조회 훅
 * - mock 모드: 실제 API 실패 시 mock 데이터로 fallback
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useJobPostDetail = (id: number | null) => {
  return useQuery<JobPostDetail>({
    queryKey: ['jobPost', id],
    queryFn: async () => {
      if (!id) throw new Error('id is required');

      const real = await fetchJobPost(id).catch(() => null);

      if (real) return real;

      if (USE_MOCK) {
        return fetchMockJobPost(id);
      }

      throw new Error('Job post not found');
    },
    enabled: id !== null,
  });
};
