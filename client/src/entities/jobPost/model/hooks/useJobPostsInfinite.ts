
import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchJobPosts, fetchMockJobPosts } from 'entities/jobPost/api/jobPost.api';
import { filterActiveDeadlineJobPosts } from 'entities/jobPost/lib/filterActiveDeadlineJobPosts';
import type { GetJobPostsParams } from 'entities/jobPost/model/types/jobPost.type';
import { USE_MOCK } from 'shared/config/env';

export const useJobPostsInfinite = (params: GetJobPostsParams) => {
  // 필터가 하나라도 적용되어 있으면 mock 데이터를 붙이지 않음
  const hasActiveFilter = !!(
    params.keyword ||
    params.location ||
    params.minWage ||
    params.wageType ||
    params.timeTags?.length ||
    params.certRequirements?.length ||
    params.jobCategories?.length ||
    params.locations?.length ||
    params.weekdays?.length ||
    params.urgentOnly
  );

  return useInfiniteQuery({
    queryKey: ['jobPosts', params],
    queryFn: async ({ pageParam }) => {
      const result = await fetchJobPosts({ ...params, cursor: pageParam });

      let contents = filterActiveDeadlineJobPosts(result.contents);

      // 필터 없고, 마지막 페이지일 때만 mock 데이터를 뒤에 붙임
      if (USE_MOCK && !hasActiveFilter && !result.hasNext) {
        const mock = await fetchMockJobPosts();
        contents = filterActiveDeadlineJobPosts([...contents, ...mock]);
      }

      return { ...result, contents };
    },
    initialPageParam: undefined as string | number | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.nextCursor : undefined,
    staleTime: 1000 * 60 * 5,
  });
};