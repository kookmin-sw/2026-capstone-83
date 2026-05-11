import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobPostsByEmployer } from 'entities/jobPost/api/jobPost.api';
import type { GetJobPostsParams } from '../types/jobPost.type';

/**
 * 고용주 본인 공고 목록 조회 (무한스크롤)
 */
export const useJobPostsByEmployer = (params: GetJobPostsParams) => {
  return useInfiniteQuery({
    queryKey: ['jobPostsEmployer', params],
    queryFn: ({ pageParam }) =>
      fetchJobPostsByEmployer({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5,
  });
};
