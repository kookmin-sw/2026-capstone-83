import { useQuery } from '@tanstack/react-query';
import { fetchResumes, fetchMockResumes } from '../../api/resume.api';
import type { ResumeResponse } from '../types/resume.type';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 이력서(인재) 목록 조회 훅
 * - mock 모드: mock 데이터 + 실제 API 응답 병합
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useResumes = () => {
  return useQuery<ResumeResponse[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      const real = await fetchResumes()
        .then((res) => res.jobPosts as unknown as ResumeResponse[])
        .catch(() => []);

      if (USE_MOCK) {
        const mock = await fetchMockResumes();
        return [...mock, ...real];
      }

      return real;
    },
  });
};
