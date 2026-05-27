import type { GetJobPostsParams } from '../model/types/jobPost.type';

export const DEFAULT_JOB_POST_SORT: NonNullable<GetJobPostsParams['sortType']> = 'RECOMMENDED';

/** URL/UI 전용. cleared = API에 sortType 미전송, undefined = 기본 RECOMMENDED */
export type JobPostSortUiState = GetJobPostsParams['sortType'] | 'cleared';

export function parseJobPostSortFromSearchParams(
  searchParams: URLSearchParams,
): JobPostSortUiState | undefined {
  if (!searchParams.has('sortType')) return undefined;
  const raw = searchParams.get('sortType');
  if (raw === '') return 'cleared';
  return raw as GetJobPostsParams['sortType'];
}

/** API 요청용 sortType — 기본값 RECOMMENDED, cleared 시 미전송 */
export function toJobPostSortApiParam(
  state: JobPostSortUiState | undefined,
): GetJobPostsParams['sortType'] | undefined {
  if (state === 'cleared') return undefined;
  if (state === undefined) return DEFAULT_JOB_POST_SORT;
  return state;
}

export function isJobPostSortOptionActive(
  state: JobPostSortUiState | undefined,
  value: NonNullable<GetJobPostsParams['sortType']>,
): boolean {
  if (state === 'cleared') return false;
  return (state ?? DEFAULT_JOB_POST_SORT) === value;
}

export function toggleJobPostSort(
  current: JobPostSortUiState | undefined,
  value: NonNullable<GetJobPostsParams['sortType']>,
): JobPostSortUiState | undefined {
  const effective = current === 'cleared' ? null : (current ?? DEFAULT_JOB_POST_SORT);

  if (effective === value) {
    if (current === undefined && value === DEFAULT_JOB_POST_SORT) return 'cleared';
    return undefined;
  }

  return value;
}
