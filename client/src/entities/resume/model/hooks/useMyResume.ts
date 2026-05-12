import { useQuery } from '@tanstack/react-query';
import { fetchMockResume } from 'entities/resume/api/resume.api';
import type { ResumeResponse } from '../types/resume.type';

/**
 * 내 이력서 조회 훅
 * 추후 실제 API 연결 시 fetchResume() (GET /api/v1/resume)으로 교체
 * 현재는 mock 데이터에서 id=1을 내 이력서로 간주합니다.
 */
export const useMyResume = () => {
  return useQuery<ResumeResponse>({
    queryKey: ['myResume'],
    queryFn: () => fetchMockResume(1), // TODO: 실제 API 연결 시 fetchResume()으로 교체
    staleTime: 1000 * 60 * 5,
  });
};
