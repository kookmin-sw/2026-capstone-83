import { authClient } from 'shared/api/httpClient';
import type { ReviewRequest, ReviewResponse, ReviewTarget } from '../model/types/review.type';

/** 구직자 → 사업장 리뷰 작성 */
export const writeEmployeeReview = async (applicationId: number, data: ReviewRequest): Promise<ReviewResponse> => {
  const response = await authClient.post<ReviewResponse>(`/api/v1/applications/${applicationId}/reviews/employee`, data);
  return response.data;
};

/** 고용주 → 구직자 리뷰 작성 */
export const writeEmployerReview = async (applicationId: number, data: ReviewRequest): Promise<ReviewResponse> => {
  const response = await authClient.post<ReviewResponse>(`/api/v1/applications/${applicationId}/reviews/employer`, data);
  return response.data;
};

/** 사업장 리뷰 목록 조회 */
export const fetchWorkplaceReviews = async (workplaceId: number): Promise<ReviewResponse[]> => {
  const response = await authClient.get<ReviewResponse[]>(`/api/v1/workplaces/${workplaceId}/reviews`);
  return response.data;
};

/** 구직자 리뷰 목록 조회 (고용주→구직자) */
export const fetchEmployeeReviews = async (userId: number): Promise<ReviewResponse[]> => {
  const response = await authClient.get<ReviewResponse[]>(`/api/v1/users/${userId}/reviews`);
  return response.data;
};

/** 내가 작성한 리뷰 목록 */
export const fetchMyReviews = async (): Promise<ReviewResponse[]> => {
  const response = await authClient.get<ReviewResponse[]>('/api/v1/reviews/my');
  return response.data;
};

/** 특정 application의 리뷰 조회 */
export const fetchReviewsByApplication = async (applicationId: number): Promise<ReviewResponse[]> => {
  const response = await authClient.get<ReviewResponse[]>(`/api/v1/applications/${applicationId}/reviews`);
  return response.data;
};

/** 리뷰 수정 (작성자만) */
export const updateReview = async (reviewId: number, data: ReviewRequest): Promise<ReviewResponse> => {
  const response = await authClient.put<ReviewResponse>(`/api/v1/reviews/${reviewId}`, data);
  return response.data;
};

/** 리뷰 삭제 (작성자만) */
export const deleteReview = async (reviewId: number): Promise<void> => {
  await authClient.delete(`/api/v1/reviews/${reviewId}`);
};

/** 사용 가능한 태그 목록 조회 */
export const fetchReviewTags = async (target: ReviewTarget): Promise<{ name: string; label: string }[]> => {
  const response = await authClient.get<{ target: string; tags: { name: string; label: string }[] }>('/api/v1/reviews/tags', {
    params: { target },
  });
  return response.data.tags;
};
