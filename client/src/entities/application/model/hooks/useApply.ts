import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyJopPost } from 'entities/application/api/application.api';

export const useApply = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobPostId: number) => applyJopPost(jobPostId),
    onSuccess: (_data, jobPostId) => {
      // 해당 공고 상세 캐시 무효화 (지원 상태 갱신)
      queryClient.invalidateQueries({ queryKey: ['jobPost', jobPostId] });
      // 공고 목록도 갱신 (applyStatus 반영)
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });
    },
  });
};
