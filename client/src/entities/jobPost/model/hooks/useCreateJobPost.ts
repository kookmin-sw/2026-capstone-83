import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { bulkOffer, createJobPost } from 'entities/jobPost/api/jobPost.api';
import type { JobPostCreateSubmit, JobPostDetail } from '../types/jobPost.type';

export interface CreateJobPostVariables {
  data: JobPostCreateSubmit;
  /** 공고 생성 성공 후 일괄 제안할 구직자 userId 목록 */
  offerUserIds?: number[];
  /** 일괄 제안 시 즉시 채용 오퍼 여부 */
  offerInstantHire?: boolean;
}

export const useCreateJobPost = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ data, offerUserIds, offerInstantHire }: CreateJobPostVariables) => {
      const created = await createJobPost({
        ...data,
        autoOfferEnabled: false,
      });
      if (offerUserIds?.length && created.id) {
        await bulkOffer(created.id, {
          userIds: offerUserIds,
          instantHire: !!offerInstantHire,
        });
      }
      return created;
    },
    onSuccess: (data: JobPostDetail, { offerUserIds }) => {
      queryClient.invalidateQueries({ queryKey: ['jobPosts'] });
      queryClient.invalidateQueries({ queryKey: ['jobPosts', 'employer'] });
      if (data?.id) {
        queryClient.invalidateQueries({ queryKey: ['offerTargets', data.id] });
        queryClient.invalidateQueries({ queryKey: ['applicants', data.id] });
      }

      if (offerUserIds?.length) {
        alert(`공고가 등록되었고, 선택한 ${offerUserIds.length}명에게 채용 제안을 보냈습니다.`);
      }

      if (data?.id) {
        navigate(`/jobpost/${data.id}`);
      } else {
        navigate('/jobposts');
      }
    },
  });
};
