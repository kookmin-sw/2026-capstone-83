import { useMutation, useQueryClient } from '@tanstack/react-query';
import { likeResume } from 'entities/resume/api/resume.api';

export const useLikeResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => likeResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
    },
  });
};
