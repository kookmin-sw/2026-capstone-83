import { useQuery } from '@tanstack/react-query';
import { fetchJobPosts, fetchMockJobPosts } from '../../api/jobPost.api';
import type { GetJobPostsParams, JobPost, JobPostListCursor } from '../types/jobPost.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 공고 목록 조회 훅
 * - mock 모드: mock 데이터 + 실제 API 응답 병합
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useJobPosts = (params: GetJobPostsParams = {}) => {
  return useQuery<JobPostListCursor>({
    queryKey: ['jobPosts', params],
    queryFn: async () => {
      const real = await fetchJobPosts(params).catch(() => ({
        contents: [] as JobPost[],
        nextCursor: null,
        hasNext: false,
      }));

      if (USE_MOCK) {
        const mock = await fetchMockJobPosts();
        return {
          ...real,
          contents: [...mock, ...real.contents],
        };
      }

      return real;
    },
  });
};
