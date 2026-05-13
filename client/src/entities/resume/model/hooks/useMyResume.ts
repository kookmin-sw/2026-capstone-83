import { useQuery } from '@tanstack/react-query';
import { fetchResume } from 'entities/resume/api/resume.api';
import type { ResumeResponse } from '../types/resume.type';

/**
 * 내 이력서 조회 훅
 * GET /api/v1/resume (토큰 기반 본인 이력서 조회)
 */
export const useMyResume = () => {
  return useQuery<ResumeResponse>({
    queryKey: ['myResume'],
    queryFn: fetchResume,
    staleTime: 1000 * 60 * 5,
  });
};
