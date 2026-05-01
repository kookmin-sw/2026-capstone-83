// entities/jobPost/model/useJobPost.ts
import { useQuery } from '@tanstack/react-query';
import type { JobPostDetail } from '../types/jobPost.type';
import { fetchJobPost } from 'entities/jobPost/api/jobPost.api';


export const useJobPost = (postId: number) => {
  return useQuery<JobPostDetail>({
    // postId를 키에 포함하여 개별 공고마다 캐싱이 되도록 합니다.
    queryKey: ['jobPost', postId],

    // 실제 데이터를 가져오는 함수입니다.
    queryFn: () => fetchJobPost(postId),

    // postId가 유효한 경우에만 쿼리를 실행하도록 설정합니다.
    enabled: !!postId && !isNaN(postId),

    // 데이터 보존 시간을 설정합니다 (예: 5분).
    staleTime: 1000 * 60 * 5,
  });
};