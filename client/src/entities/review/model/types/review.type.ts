/** 리뷰 방향 */
export type ReviewTarget = 'EMPLOYEE_TO_WORKPLACE' | 'EMPLOYER_TO_EMPLOYEE';

/** 구직자 → 사업장 태그 */
export type EmployeeReviewTag =
  | 'GOOD_PAY'
  | 'GOOD_ATMOSPHERE'
  | 'CLEAR_DESCRIPTION'
  | 'KIND_EMPLOYER'
  | 'EASY_WORK'
  | 'GOOD_LOCATION';

/** 고용주 → 구직자 태그 */
export type EmployerReviewTag =
  | 'PUNCTUAL'
  | 'HARD_WORKING'
  | 'QUICK_LEARNER'
  | 'GOOD_MANNER'
  | 'RESPONSIBLE'
  | 'WANT_REHIRE';

export type ReviewTag = EmployeeReviewTag | EmployerReviewTag;

/** 태그 한글 라벨 맵 */
export const REVIEW_TAG_LABEL: Record<ReviewTag, string> = {
  // 구직자 → 사업장
  GOOD_PAY: '급여가 정확했어요',
  GOOD_ATMOSPHERE: '분위기가 좋았어요',
  CLEAR_DESCRIPTION: '업무 설명이 명확했어요',
  KIND_EMPLOYER: '사장님이 친절했어요',
  EASY_WORK: '업무 강도가 적당했어요',
  GOOD_LOCATION: '교통이 편리했어요',
  // 고용주 → 구직자
  PUNCTUAL: '시간을 잘 지켜요',
  HARD_WORKING: '성실하게 일해요',
  QUICK_LEARNER: '습득이 빨라요',
  GOOD_MANNER: '매너가 좋아요',
  RESPONSIBLE: '책임감이 강해요',
  WANT_REHIRE: '다시 함께 일하고 싶어요',
};

/** 리뷰 작성 요청 */
export interface ReviewRequest {
  tags: ReviewTag[];
  content?: string;
}

/** 리뷰 응답 */
export interface ReviewResponse {
  reviewId: number;
  applicationId: number;
  target: ReviewTarget;
  reviewerId: number;
  reviewerName: string;
  reviewerProfileImageUrl: string;
  tags: ReviewTag[];
  tagLabels: string[];
  content?: string;
  createdAt: string;
}
