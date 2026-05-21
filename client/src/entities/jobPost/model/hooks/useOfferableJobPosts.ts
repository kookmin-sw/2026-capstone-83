import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchOfferableJobPosts } from 'entities/jobPost/api/jobPost.api';

/**
 * 고용 제안 모달용 — 제안 가능 공고 목록 (구직자와 이미 연결된 공고 제외)
 */
export const useOfferableJobPosts = (applicantUserId: number | undefined, enabled: boolean) => {
  return useInfiniteQuery({
    queryKey: ['offerableJobPosts', applicantUserId],
    queryFn: ({ pageParam }) =>
      fetchOfferableJobPosts({
        applicantUserId: applicantUserId!,
        cursor: pageParam,
        size: 20,
      }),
    initialPageParam: undefined as number | undefined,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.nextCursor ?? undefined : undefined),
    enabled: enabled && applicantUserId != null,
    staleTime: 1000 * 60,
  });
};
