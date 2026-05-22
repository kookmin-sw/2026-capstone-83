import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  writeEmployeeReview,
  writeEmployerReview,
  updateReview,
  deleteReview,
  fetchWorkplaceReviews,
  fetchEmployeeReviews,
  fetchMyReviews,
  fetchReviewsByApplication,
  fetchReviewTags,
} from '../../api/review.api';
import type { ReviewRequest, ReviewResponse, ReviewTarget } from '../types/review.type';

/** 사업장 리뷰 목록 조회 */
export const useWorkplaceReviews = (workplaceId: number | null) => {
  return useQuery<ReviewResponse[]>({
    queryKey: ['reviews', 'workplace', workplaceId],
    queryFn: () => fetchWorkplaceReviews(workplaceId!),
    enabled: workplaceId !== null,
  });
};

/** 구직자 리뷰 목록 조회 (고용주→구직자) */
export const useEmployeeReviews = (userId: number | null) => {
  return useQuery<ReviewResponse[]>({
    queryKey: ['reviews', 'employee', userId],
    queryFn: () => fetchEmployeeReviews(userId!),
    enabled: userId !== null,
  });
};

/** 내가 작성한 리뷰 목록 */
export const useMyReviews = () => {
  return useQuery<ReviewResponse[]>({
    queryKey: ['reviews', 'my'],
    queryFn: fetchMyReviews,
  });
};

/** 특정 application의 리뷰 조회 */
export const useReviewsByApplication = (applicationId: number | null) => {
  return useQuery<ReviewResponse[]>({
    queryKey: ['reviews', 'application', applicationId],
    queryFn: () => fetchReviewsByApplication(applicationId!),
    enabled: applicationId !== null,
  });
};

/** 사용 가능한 태그 목록 조회 */
export const useReviewTags = (target: ReviewTarget) => {
  return useQuery({
    queryKey: ['reviews', 'tags', target],
    queryFn: () => fetchReviewTags(target),
    staleTime: 1000 * 60 * 30, // 태그 목록은 자주 안 바뀌니 30분 캐시
  });
};

/** 구직자 → 사업장 리뷰 작성 */
export const useWriteEmployeeReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: number; data: ReviewRequest }) =>
      writeEmployeeReview(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

/** 고용주 → 구직자 리뷰 작성 */
export const useWriteEmployerReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ applicationId, data }: { applicationId: number; data: ReviewRequest }) =>
      writeEmployerReview(applicationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

/** 리뷰 수정 */
export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, data }: { reviewId: number; data: ReviewRequest }) =>
      updateReview(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

/** 리뷰 삭제 */
export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};
