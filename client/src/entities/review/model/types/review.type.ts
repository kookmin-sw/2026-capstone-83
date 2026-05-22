/** 리뷰 방향 */
export type ReviewTarget = 'EMPLOYEE_TO_WORKPLACE' | 'EMPLOYER_TO_EMPLOYEE';

/** 구직자 → 사업장 긍정 태그 */
export type EmployeePositiveReviewTag =
  | 'GOOD_PAY'
  | 'GOOD_ATMOSPHERE'
  | 'CLEAR_DESCRIPTION'
  | 'KIND_EMPLOYER'
  | 'EASY_WORK'
  | 'GOOD_LOCATION';

/** 구직자 → 사업장 부정 태그 */
export type EmployeeNegativeReviewTag =
  | 'BAD_PAY'
  | 'BAD_ATMOSPHERE'
  | 'UNCLEAR_DESCRIPTION'
  | 'UNKIND_EMPLOYER'
  | 'HARD_WORK'
  | 'BAD_LOCATION';

/** 고용주 → 구직자 긍정 태그 */
export type EmployerPositiveReviewTag =
  | 'PUNCTUAL'
  | 'HARD_WORKING'
  | 'QUICK_LEARNER'
  | 'GOOD_MANNER'
  | 'RESPONSIBLE'
  | 'WANT_REHIRE';

/** 고용주 → 구직자 부정 태그 */
export type EmployerNegativeReviewTag =
  | 'LATE'
  | 'LAZY'
  | 'SLOW_LEARNER'
  | 'BAD_MANNER'
  | 'IRRESPONSIBLE'
  | 'NO_REHIRE';

export type EmployeeReviewTag = EmployeePositiveReviewTag | EmployeeNegativeReviewTag;
export type EmployerReviewTag = EmployerPositiveReviewTag | EmployerNegativeReviewTag;
export type ReviewTag = EmployeeReviewTag | EmployerReviewTag;

export interface ReviewTagPair<T extends ReviewTag = ReviewTag> {
  positive: T;
  negative: T;
}

/** 태그 한글 라벨 맵 */
export const REVIEW_TAG_LABEL: Record<ReviewTag, string> = {
  GOOD_PAY: '급여가 정확했어요',
  GOOD_ATMOSPHERE: '분위기가 좋았어요',
  CLEAR_DESCRIPTION: '업무 설명이 명확했어요',
  KIND_EMPLOYER: '사장님이 친절했어요',
  EASY_WORK: '업무 강도가 적당했어요',
  GOOD_LOCATION: '교통이 편리했어요',
  BAD_PAY: '급여 지급이 불투명했어요',
  BAD_ATMOSPHERE: '분위기가 불편했어요',
  UNCLEAR_DESCRIPTION: '업무 설명이 부족했어요',
  UNKIND_EMPLOYER: '사장님이 불친절했어요',
  HARD_WORK: '업무 강도가 너무 높았어요',
  BAD_LOCATION: '교통이 불편했어요',
  PUNCTUAL: '시간을 잘 지켜요',
  HARD_WORKING: '성실하게 일해요',
  QUICK_LEARNER: '습득이 빨라요',
  GOOD_MANNER: '매너가 좋아요',
  RESPONSIBLE: '책임감이 강해요',
  WANT_REHIRE: '다시 함께 일하고 싶어요',
  LATE: '시간을 잘 안 지켜요',
  LAZY: '성실하지 않아요',
  SLOW_LEARNER: '습득이 느려요',
  BAD_MANNER: '매너가 아쉬워요',
  IRRESPONSIBLE: '책임감이 부족해요',
  NO_REHIRE: '다시 함께 일하기 어려워요',
};

export const EMPLOYER_REVIEW_TAG_PAIRS: ReviewTagPair<EmployerReviewTag>[] = [
  { positive: 'PUNCTUAL', negative: 'LATE' },
  { positive: 'HARD_WORKING', negative: 'LAZY' },
  { positive: 'QUICK_LEARNER', negative: 'SLOW_LEARNER' },
  { positive: 'GOOD_MANNER', negative: 'BAD_MANNER' },
  { positive: 'RESPONSIBLE', negative: 'IRRESPONSIBLE' },
  { positive: 'WANT_REHIRE', negative: 'NO_REHIRE' },
];

export const EMPLOYEE_REVIEW_TAG_PAIRS: ReviewTagPair<EmployeeReviewTag>[] = [
  { positive: 'GOOD_PAY', negative: 'BAD_PAY' },
  { positive: 'GOOD_ATMOSPHERE', negative: 'BAD_ATMOSPHERE' },
  { positive: 'CLEAR_DESCRIPTION', negative: 'UNCLEAR_DESCRIPTION' },
  { positive: 'KIND_EMPLOYER', negative: 'UNKIND_EMPLOYER' },
  { positive: 'EASY_WORK', negative: 'HARD_WORK' },
  { positive: 'GOOD_LOCATION', negative: 'BAD_LOCATION' },
];

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
