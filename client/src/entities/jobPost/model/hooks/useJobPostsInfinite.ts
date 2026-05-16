
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobPosts, fetchMockJobPosts } from 'entities/jobPost/api/jobPost.api';
import type { GetJobPostsParams } from 'entities/jobPost/model/types/jobPost.type';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const useJobPostsInfinite = (params: GetJobPostsParams) => {
  return useInfiniteQuery({
    queryKey: ['jobPosts', params],
    queryFn: async ({ pageParam }) => {
      const result = await fetchJobPosts({ ...params, cursor: pageParam });

      // 마지막 페이지(더 이상 다음이 없을 때)에 mock 데이터를 뒤에 붙임
      if (USE_MOCK && !result.hasNext) {
        const mock = await fetchMockJobPosts();
        return {
          ...result,
          jobPosts: [...result.jobPosts, ...mock],
        };
      }

      return result;
    },
    initialPageParam: undefined as string | number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5,
  });
};