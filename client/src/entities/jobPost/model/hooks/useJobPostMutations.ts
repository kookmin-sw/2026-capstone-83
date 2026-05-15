import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeJobPost } from 'entities/jobPost/api/jobPost.api';

/**
 * 공고 수정 (서버에 PUT 엔드포인트 없음 - 추후 추가 시 활성화)
 */
// export const useUpdateJobPost = () => { ... };

/**
 * 공고 삭제 (서버에 DELETE 엔드포인트 없음 - 추후 추가 시 활성화)
 */
// export const useDeleteJobPost = () => { ... };

/**
 * 공고 마감 처리
 */
export const useCloseJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => closeJobPost(id),
    onSuccess: (_response, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobPost', id] });
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });
    },
    onError: (error) => {
      console.error('공고 마감 실패:', error);
      alert('공고 마감 중 오류가 발생했습니다.');
    },
  });
};
