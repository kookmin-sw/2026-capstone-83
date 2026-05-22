import {
  EMPLOYER_REVIEW_TAG_PAIRS,
  type EmployerReviewTag,
} from 'entities/review/model/types/review.type';

export function getEmployerReviewTagVariant(tag: EmployerReviewTag): 'positive' | 'negative' {
  return EMPLOYER_REVIEW_TAG_PAIRS.some((pair) => pair.negative === tag) ? 'negative' : 'positive';
}

/** 긍정 태그 전부 → 부정 태그 전부 (피커·표시 순서 통일) */
export function sortEmployerReviewTags(tags: EmployerReviewTag[]): EmployerReviewTag[] {
  const tagSet = new Set(tags);
  const sorted: EmployerReviewTag[] = [];

  for (const pair of EMPLOYER_REVIEW_TAG_PAIRS) {
    if (tagSet.has(pair.positive)) sorted.push(pair.positive);
  }
  for (const pair of EMPLOYER_REVIEW_TAG_PAIRS) {
    if (tagSet.has(pair.negative)) sorted.push(pair.negative);
  }
  for (const tag of tags) {
    if (!sorted.includes(tag)) sorted.push(tag);
  }

  return sorted;
}

/** 같은 쌍의 긍정·부정은 동시 선택 불가 — 반대쪽 클릭 시 교체 */
export function toggleEmployerReviewTag(
  prev: EmployerReviewTag[],
  tag: EmployerReviewTag,
): EmployerReviewTag[] {
  const pair = EMPLOYER_REVIEW_TAG_PAIRS.find(
    (p) => p.positive === tag || p.negative === tag,
  );

  if (!pair) {
    return prev.includes(tag) ? prev.filter((t) => t !== tag) : sortEmployerReviewTags([...prev, tag]);
  }

  const counterpart = pair.positive === tag ? pair.negative : pair.positive;

  if (prev.includes(tag)) {
    return sortEmployerReviewTags(prev.filter((t) => t !== tag));
  }

  return sortEmployerReviewTags([...prev.filter((t) => t !== counterpart), tag]);
}
