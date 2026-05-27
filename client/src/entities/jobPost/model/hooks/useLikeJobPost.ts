import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeJobPost } from 'entities/jobPost/api/jobPost.api';

export const useLikeJobPost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => likeJobPost(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobPost', id] });
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });
      queryClient.invalidateQueries({ queryKey: ['likedJobPosts'] });
    },
  });
};
