import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchLikedJobPosts } from 'entities/jobPost/api/jobPost.api';
import type { CursorParams } from 'shared/api/types';

const DEFAULT_SIZE = 12;

export const useLikedJobPostsInfinite = (params: Pick<CursorParams, 'size'> = {}) => {
  const size = params.size ?? DEFAULT_SIZE;

  return useInfiniteQuery({
    queryKey: ['likedJobPosts', size],
    queryFn: ({ pageParam }) =>
      fetchLikedJobPosts({ cursor: pageParam as number | undefined, size }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? (lastPage.nextCursor ?? undefined) : undefined,
    staleTime: 1000 * 60,
  });
};
