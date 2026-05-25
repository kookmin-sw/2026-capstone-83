import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiErrorMessage } from 'shared/lib/getApiErrorMessage';
import { clearPendingFlowFlag, markPendingAfterOfferAccept } from '../../lib/pendingFlowStorage';
import {
  acceptApplicant,
  rejectApplicant,
  cancelHire,
  fetchApplicants,
  fetchWorkers,
  completeWork,
  fetchApplications,
  acceptOffer,
  acceptApproval,
  confirmHire,
  offerJobPost,
  cancelApplication,
} from 'entities/application/api/application.api';
import {
  toApplicationWithJobPost,
  type ApplicantResponse,
  type ApplicationWithJobPost,
} from '../types/application.type';

/**
 * 지원자 목록 조회 (고용주용)
 */
export const useApplicants = (jobPostId: number) => {
  return useQuery<ApplicantResponse[]>({
    queryKey: ['applicants', jobPostId],
    queryFn: async () => {
      const data = await fetchApplicants(jobPostId);
      return data.contents;
    },
    enabled: !!jobPostId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 근무자 목록 조회 (고용주용)
 */
export const useWorkers = (jobPostId: number) => {
  return useQuery<ApplicantResponse[]>({
    queryKey: ['workers', jobPostId],
    queryFn: () => fetchWorkers(jobPostId),
    enabled: !!jobPostId,
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 지원 내역 조회 (구직자용)
 */
export const useApplications = () => {
  return useQuery<ApplicationWithJobPost[]>({
    queryKey: ['applications'],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const data = await fetchApplications();
      return data.contents.map(toApplicationWithJobPost);
    },
  });
};

/**
 * 지원자 승인 (고용주용)
 */
export const useAcceptApplicant = (jobPostId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => acceptApplicant(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['workers', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['jobPost', jobPostId] });
    },
  });
};

/**
 * 지원자 거절 (고용주용)
 */
export const useRejectApplicant = (jobPostId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => rejectApplicant(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobPostId] });
    },
  });
};

/**
 * 채용 취소 (고용주용, HIRED 상태만)
 */
export const useCancelHire = (jobPostId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => cancelHire(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['workers', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['jobPost', jobPostId] });
    },
  });
};

/**
 * 근무 완료 처리 (고용주용)
 */
export const useCompleteWork = (jobPostId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => completeWork(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['workers', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['jobPost', jobPostId] });
    },
  });
};

/**
 * 채용 제안 수락 (구직자용)
 */
export const useAcceptOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => acceptOffer(applicationId),
    onSuccess: (_data, applicationId) => {
      markPendingAfterOfferAccept(applicationId);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

/** 구직자 최종 수락 — PENDING → HIRED (지원 플로우) */
export const useAcceptApproval = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => acceptApproval(applicationId),
    onSuccess: (_data, applicationId) => {
      clearPendingFlowFlag(applicationId);
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

/** 고용주 최종 확정 — PENDING → HIRED (제안 플로우) */
export const useConfirmHire = (jobPostId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => confirmHire(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['workers', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['jobPost', jobPostId] });
    },
  });
};

/** 고용주 채용 제안 */
export const useOfferJobPost = (jobPostId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: number) => offerJobPost(jobPostId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['offerableJobPosts'] });
      queryClient.invalidateQueries({ queryKey: ['offerTargets', jobPostId] });
    },
  });
};

/** 고용주 채용 제안 (공고·구직자 선택 후) */
export const useOfferJobPostToApplicant = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobPostId, userId }: { jobPostId: number; userId: number }) =>
      offerJobPost(jobPostId, userId),
    onSuccess: (_data, { jobPostId }) => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['offerableJobPosts'] });
      queryClient.invalidateQueries({ queryKey: ['offerTargets', jobPostId] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

/** 지원/제안 취소 (구직자) */
export const useCancelApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (applicationId: number) => cancelApplication(applicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
};

export const getApplicationMutationErrorMessage = (error: unknown): string | undefined => {
  const message = getApiErrorMessage(error, '');
  return message || undefined;
};
