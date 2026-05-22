import { useQuery } from '@tanstack/react-query';
import { fetchResume } from 'entities/resume/api/resume.api';
import type { ResumeResponse } from '../types/resume.type';

/**
 * 내 이력서 조회 훅
 * GET /api/v1/resume (토큰 기반 본인 이력서 조회)
 */
/** useResume과 동일 API·캐시 키 (저장 후 조회 페이지 즉시 반영) */
export const useMyResume = () => {
  return useQuery<ResumeResponse>({
    queryKey: ['resume'],
    queryFn: fetchResume,
    staleTime: 1000 * 60 * 5,
  });
};
