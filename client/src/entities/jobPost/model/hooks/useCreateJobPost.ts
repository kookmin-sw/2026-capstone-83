import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createJobPost } from 'entities/jobPost/api/jobPost.api';
import type { JobPostCreateSubmit, JobPostDetail } from '../types/jobPost.type';

export const useCreateJobPost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: JobPostCreateSubmit) => createJobPost(data),
    onSuccess: (data: JobPostDetail) => {
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });
      queryClient.invalidateQueries({ queryKey: ['jobPosts', 'employer'] });

      if (data?.id) {
        navigate(`/jobpost/${data.id}`);
      } else {
        navigate('/jobposts');
      }
    },
  });
};
