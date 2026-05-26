import {
  EMPLOYEE_REVIEW_TAG_PAIRS,
  type EmployeeReviewTag,
  type EmployerReviewTag,
} from 'entities/review/model/types/review.type';
import type { BadgeScheme } from 'shared/types/theme';

export type EmployerReviewTagVariant = 'positive' | 'neutral' | 'negative';

export function getEmployerReviewTagVariant(tag: EmployerReviewTag): EmployerReviewTagVariant {
  if (tag === 'BAD') return 'negative';
  if (tag === 'NEUTRAL') return 'neutral';
  return 'positive';
}

export function getEmployeeReviewTagVariant(tag: EmployeeReviewTag): 'positive' | 'negative' {
  return EMPLOYEE_REVIEW_TAG_PAIRS.some((pair) => pair.negative === tag) ? 'negative' : 'positive';
}

export function getEmployeeReviewBadgeScheme(tag: EmployeeReviewTag): BadgeScheme {
  return getEmployeeReviewTagVariant(tag) === 'negative' ? 'warning' : 'secondary';
}

/** 긍정 태그 → 부정 태그 (피커·표시 순서 통일) */
export function sortEmployeeReviewTags(tags: EmployeeReviewTag[]): EmployeeReviewTag[] {
  const tagSet = new Set(tags);
  const sorted: EmployeeReviewTag[] = [];

  for (const pair of EMPLOYEE_REVIEW_TAG_PAIRS) {
    if (tagSet.has(pair.positive)) sorted.push(pair.positive);
  }
  for (const pair of EMPLOYEE_REVIEW_TAG_PAIRS) {
    if (tagSet.has(pair.negative)) sorted.push(pair.negative);
  }
  for (const tag of tags) {
    if (!sorted.includes(tag)) sorted.push(tag);
  }

  return sorted;
}

/** 같은 쌍의 긍정·부정은 동시 선택 불가 — 반대쪽 클릭 시 교체 */
export function toggleEmployeeReviewTag(
  prev: EmployeeReviewTag[],
  tag: EmployeeReviewTag,
): EmployeeReviewTag[] {
  const pair = EMPLOYEE_REVIEW_TAG_PAIRS.find(
    (p) => p.positive === tag || p.negative === tag,
  );

  if (!pair) {
    return prev.includes(tag) ? prev.filter((t) => t !== tag) : sortEmployeeReviewTags([...prev, tag]);
  }

  const counterpart = pair.positive === tag ? pair.negative : pair.positive;

  if (prev.includes(tag)) {
    return sortEmployeeReviewTags(prev.filter((t) => t !== tag));
  }

  return sortEmployeeReviewTags([...prev.filter((t) => t !== counterpart), tag]);
}

export function getEmployerReviewBadgeScheme(tag: EmployerReviewTag): BadgeScheme {
  const variant = getEmployerReviewTagVariant(tag);
  if (variant === 'negative') return 'warning';
  if (variant === 'neutral') return 'neutral';
  return 'secondary';
}
