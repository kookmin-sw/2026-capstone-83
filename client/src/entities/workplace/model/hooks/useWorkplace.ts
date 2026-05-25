import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { refreshProfileSetupStatus } from 'entities/profileSetup/lib/loadProfileSetupStatus';
import { createWorkplace, updateWorkplace, deleteWorkplace, fetchUserWorkplaces, fetchWorkplaceById } from 'entities/workplace/api/workplace.api';
import type {
  Workplace,
  WorkplaceCreatePayload,
  WorkplaceUpdatePayload,
} from '../types/workplace.type';

/**
 * 내 작업장 목록 조회
 */
export const useWorkplaces = () => {
  return useQuery<Workplace[]>({
    queryKey: ['workplaces'],
    queryFn: fetchUserWorkplaces,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 작업장 상세 조회
 */
export const useWorkplace = (id: number) => {
  return useQuery<Workplace>({
    queryKey: ['workplace', id],
    queryFn: () => fetchWorkplaceById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 작업장 생성
 */
export const useCreateWorkplace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkplaceCreatePayload) => createWorkplace(payload),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['workplaces'] });
      await refreshProfileSetupStatus('EMPLOYER');
    },
  });
};

/**
 * 작업장 수정
 */
export const useUpdateWorkplace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkplaceUpdatePayload) => updateWorkplace(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['workplaces'] });
      queryClient.invalidateQueries({ queryKey: ['workplace', variables.id] });
    },
  });
};

/**
 * 작업장 삭제
 */
export const useDeleteWorkplace = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteWorkplace(id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['workplaces'] });
      await refreshProfileSetupStatus('EMPLOYER');
    },
  });
};
