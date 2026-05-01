
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobPosts } from 'entities/jobPost/api/jobPost.api';
import type { GetJobPostsParams } from 'entities/jobPost/model/types/jobPost.type';


export const useJobPostsInfinite = (params: GetJobPostsParams) => {
  return useInfiniteQuery({
    queryKey: ['jobPosts', params], // 필터가 바뀌면 캐시를 새로 생성합니다.
    queryFn: ({ pageParam }) =>
      fetchJobPosts({ ...params, cursor: pageParam as number | string }),
    initialPageParam: undefined, // 첫 요청 시 커서는 없습니다.
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined, // 다음 커서 존재 여부 판단
    staleTime: 1000 * 60 * 5, // 5분간 데이터를 최신으로 간주합니다.
  });
};