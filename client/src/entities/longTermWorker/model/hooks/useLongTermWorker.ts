import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchLongTermWorkerStatus,
  toggleLongTermWorker,
} from 'entities/longTermWorker/api/longTermWorker.api';

export const useLongTermWorkerStatus = (applicantUserId: number | undefined, enabled = true) => {
  return useQuery({
    queryKey: ['longTermWorker', applicantUserId],
    queryFn: () => fetchLongTermWorkerStatus(applicantUserId!),
    enabled: !!applicantUserId && enabled,
    staleTime: 1000 * 60,
  });
};

export const useToggleLongTermWorker = (applicantUserId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleLongTermWorker(applicantUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['longTermWorker', applicantUserId] });
      queryClient.invalidateQueries({ queryKey: ['offerTargets'] });
    },
  });
};
