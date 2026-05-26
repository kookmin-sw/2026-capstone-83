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

/** 고용주 → 구직자 태그 (단일 선택) */
export type EmployerReviewTag = 'GOOD' | 'NEUTRAL' | 'BAD';

export type EmployeeReviewTag = EmployeePositiveReviewTag | EmployeeNegativeReviewTag;
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
  GOOD: '좋아요',
  NEUTRAL: '무난해요',
  BAD: '싫어요',
};

/** 고용주 → 구직자 태그 선택 순서 */
export const EMPLOYER_REVIEW_TAGS: EmployerReviewTag[] = ['GOOD', 'NEUTRAL', 'BAD'];

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
