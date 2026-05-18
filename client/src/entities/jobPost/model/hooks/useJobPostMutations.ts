import { useMutation, useQueryClient } from '@tanstack/react-query';
import { closeJobPost, deleteJobPost } from 'entities/jobPost/api/jobPost.api';

export const useDeleteJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteJobPost(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });
      queryClient.removeQueries({ queryKey: ['jobPost', id] });
    },
    onError: (error: unknown) => {
      console.error('공고 삭제 실패:', error);
      alert('공고 삭제 중 오류가 발생했습니다. 채용 확정 지원자가 있으면 삭제할 수 없습니다.');
    },
  });
};

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
