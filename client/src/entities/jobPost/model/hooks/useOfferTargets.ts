import { useQuery } from '@tanstack/react-query';
import { fetchOfferTargets } from 'entities/jobPost/api/jobPost.api';

export const useOfferTargets = (jobPostId: number, enabled = true) => {
  return useQuery({
    queryKey: ['offerTargets', jobPostId],
    queryFn: () => fetchOfferTargets(jobPostId),
    enabled: !!jobPostId && enabled,
    staleTime: 1000 * 60,
  });
};
