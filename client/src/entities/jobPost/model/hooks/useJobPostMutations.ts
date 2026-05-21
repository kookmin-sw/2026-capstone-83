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
  });
};
