import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { updateJobPost } from 'entities/jobPost/api/jobPost.api';
import type { JobPostUpdatePayload } from 'entities/jobPost/model/types/jobPost.type';

export const useUpdateJobPostMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: JobPostUpdatePayload }) =>
      updateJobPost(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobPost', data.id] });
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });
      navigate(`/jobpost/${data.id}`);
    },
  });
};
