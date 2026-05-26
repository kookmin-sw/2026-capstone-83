import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createWorkerAvailability,
  deleteWorkerAvailability,
  fetchWorkerAvailabilityRange,
  updateWorkerAvailability,
} from '../../api/workerAvailability.api';
import type {
  WorkerAvailabilityCreateRequest,
  WorkerAvailabilityRangeParams,
  WorkerAvailabilityUpdateRequest,
} from '../types/workerAvailability.type';

export const workerAvailabilityQueryKey = {
  all: ['workerAvailability'] as const,
  range: (params: WorkerAvailabilityRangeParams) =>
    [...workerAvailabilityQueryKey.all, 'range', params.fromDate, params.toDate] as const,
};

/** 기간별 가용시간 조회 */
export const useWorkerAvailabilityRange = (
  params: WorkerAvailabilityRangeParams | null,
  enabled = true,
) => {
  return useQuery({
    queryKey: params
      ? workerAvailabilityQueryKey.range(params)
      : [...workerAvailabilityQueryKey.all, 'range', 'disabled'],
    queryFn: () => fetchWorkerAvailabilityRange(params!),
    enabled: enabled && params !== null,
  });
};

const invalidateAfterMutation = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: workerAvailabilityQueryKey.all });
  queryClient.invalidateQueries({ queryKey: ['applications'] });
};

/** 가용시간 등록 */
export const useCreateWorkerAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WorkerAvailabilityCreateRequest) => createWorkerAvailability(data),
    onSuccess: () => invalidateAfterMutation(queryClient),
  });
};

/** 가용시간 수정 */
export const useUpdateWorkerAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: WorkerAvailabilityUpdateRequest }) =>
      updateWorkerAvailability(id, data),
    onSuccess: () => invalidateAfterMutation(queryClient),
  });
};

/** 가용시간 삭제 */
export const useDeleteWorkerAvailability = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWorkerAvailability(id),
    onSuccess: () => invalidateAfterMutation(queryClient),
  });
};
