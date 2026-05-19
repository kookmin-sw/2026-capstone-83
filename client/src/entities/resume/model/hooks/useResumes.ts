import { useQuery } from '@tanstack/react-query';
import { fetchResumes, fetchMockResumes } from '../../api/resume.api';
import { toResumeCardItem } from '../../lib/toResumeCardItem';
import type { ResumeCardItem } from '../types/resume.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 이력서(인재) 목록 조회 훅 — GET /api/v1/resumes (ResumeCardResponse)
 */
export const useResumes = () => {
  return useQuery<ResumeCardItem[]>({
    queryKey: ['resumes'],
    queryFn: async () => {
      const real = await fetchResumes()
        .then((res) => res.contents)
        .catch(() => []);

      if (USE_MOCK) {
        const mock = (await fetchMockResumes()).map(toResumeCardItem);
        return [...mock, ...real];
      }

      return real;
    },
  });
};
