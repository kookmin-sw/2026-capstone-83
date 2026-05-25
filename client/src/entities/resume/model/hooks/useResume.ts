import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { refreshProfileSetupStatus } from 'entities/profileSetup/lib/loadProfileSetupStatus';
import {
  fetchResume,
  updateResume,
  createCareer,
  updateCareer,
  deleteCareer,
  createCertificate,
  deleteCertificate,
} from 'entities/resume/api/resume.api';
import type { Career, CareerRequest, ResumeRequest, ResumeResponse } from '../types/resume.type';
import type { CertificateType } from 'shared/types/certificate';

/**
 * 이력서 조회
 */
export const useResume = () => {
  return useQuery<ResumeResponse>({
    queryKey: ['resume'],
    queryFn: fetchResume,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 이력서 수정 (학력 정보)
 */
export const useUpdateResume = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ResumeRequest) => updateResume(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['resume'] });
      await queryClient.refetchQueries({ queryKey: ['resume'] });
      await refreshProfileSetupStatus('APPLICANT');
    },
  });
};

/**
 * 경력 추가
 */
export const useCreateCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CareerRequest) => createCareer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  });
};

/**
 * 경력 수정
 */
export const useUpdateCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Career) => updateCareer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  });
};

/**
 * 경력 삭제
 */
export const useDeleteCareer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCareer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  });
};


/**
 * 자격/인증 추가
 */
export const useCreateCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { type: CertificateType }) => createCertificate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  });
};

/**
 * 자격/인증 삭제
 */
export const useDeleteCertificate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resume'] });
    },
  });
};
