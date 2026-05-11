import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { updateJobPost, deleteJobPost } from 'entities/jobPost/api/jobPost.api';
import type { JobPostUpdate } from '../types/jobPost.type';

/**
 * 공고 수정
 */
export const useUpdateJobPost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: JobPostUpdate) => updateJobPost(data),
    onSuccess: (_response, variables) => {
      // 수정된 공고 상세 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['jobPost', variables.id] });
      // 목록도 갱신
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });

      console.log('공고가 수정되었습니다.');
      navigate(`/jobpost/${variables.id}`);
    },
    onError: (error) => {
      console.error('공고 수정 실패:', error);
      alert('공고 수정 중 오류가 발생했습니다.');
    },
  });
};

/**
 * 공고 삭제
 */
export const useDeleteJobPost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: number) => deleteJobPost(id),
    onSuccess: () => {
      // 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });

      console.log('공고가 삭제되었습니다.');
      navigate('/jobposts');
    },
    onError: (error) => {
      console.error('공고 삭제 실패:', error);
      alert('공고 삭제 중 오류가 발생했습니다.');
    },
  });
};
