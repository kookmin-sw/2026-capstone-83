import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkOffer } from 'entities/jobPost/api/jobPost.api';
import type { BulkOfferRequest } from '../types/offer.type';

export const useBulkOffer = (jobPostId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: BulkOfferRequest) => bulkOffer(jobPostId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offerTargets', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['applicants', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['jobPost', jobPostId] });
    },
  });
};
