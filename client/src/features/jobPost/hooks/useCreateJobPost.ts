// features/jobPost/api/useCreateJobPost.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createJobPost } from 'entities/jobPost/api/jobPost.api';
import type { JobPostCreate } from 'entities/jobPost/model/types/jobPost.type';
import { useNavigate } from 'react-router-dom';

export const useCreateJobPost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    // 실제 생성 API 호출
    mutationFn: (data: JobPostCreate) => createJobPost(data),

    // 생성 성공 시 처리
    onSuccess: () => {
      // 새로운 공고가 생겼으므로 기존 공고 목록('jobPosts')을 무효화하여 
      // 목록 페이지로 돌아갔을 때 최신 데이터를 다시 불러오게 합니다.
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });

      // 성공 알림(Toast 등)이나 페이지 이동 로직을 여기에 추가할 수 있습니다.
      console.log('공고가 성공적으로 등록되었습니다.');
      navigate(-1);

    },

    // 에러 발생 시 처리
    onError: (error) => {
      console.error('공고 등록 실패:', error);
      alert('공고 등록 중 오류가 발생했습니다.');
    },
  });
};