/**
 * 쉼표(,)로 구분된 문자열을 배열로 변환합니다.
 * 공백 제거 및 빈 문자열 필터링을 포함합니다.
 */
export const splitByComma = (value: string | unknown): string[] => {
  if (typeof value !== 'string') return [];

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean); // 빈 문자열("") 및 null/undefined 제거
};

/**
 * 배열을 다시 쉼표로 구분된 문자열로 변환합니다. (수정 페이지 등에서 사용)
 */
export const joinByComma = (value: string[] | unknown): string => {
  if (!Array.isArray(value)) return '';
  return value.join(', ');
};