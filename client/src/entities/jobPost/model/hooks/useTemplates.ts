import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTemplates,
  fetchTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../../api/template.api';
import type { JobPostTemplateRequest, JobPostTemplateResponse } from '../types/template.type';

/** 내 템플릿 목록 조회 */
export const useTemplates = () => {
  return useQuery<JobPostTemplateResponse[]>({
    queryKey: ['templates'],
    queryFn: fetchTemplates,
  });
};

/** 템플릿 상세 조회 */
export const useTemplate = (id: number | null) => {
  return useQuery<JobPostTemplateResponse>({
    queryKey: ['templates', id],
    queryFn: () => fetchTemplate(id!),
    enabled: id !== null,
  });
};

/** 템플릿 생성 */
export const useCreateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: JobPostTemplateRequest) => createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

/** 템플릿 수정 */
export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: JobPostTemplateRequest }) =>
      updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};

/** 템플릿 삭제 */
export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
};
