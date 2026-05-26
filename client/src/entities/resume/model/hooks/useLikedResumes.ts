import { useQuery } from '@tanstack/react-query';
import { fetchLikedResumes } from '../../api/resume.api';
import type { ResumeCardItem } from '../types/resume.type';

const LIKED_LIST_SIZE = 100;

/** 고용주가 좋아요한 이력서 목록 */
export const useLikedResumes = (enabled = true) => {
  return useQuery<ResumeCardItem[]>({
    queryKey: ['resumes', 'liked'],
    queryFn: async () => {
      const page = await fetchLikedResumes({ size: LIKED_LIST_SIZE });
      return page.contents;
    },
    enabled,
  });
};
