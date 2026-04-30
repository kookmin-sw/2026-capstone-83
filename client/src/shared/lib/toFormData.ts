// shared/lib/utils/formData.ts

/**
 * 일반 객체를 FormData 객체로 변환합니다.
 * 파일, 배열, 일반 값을 모두 처리합니다.
 */
export const toFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    // 1. 값이 없으면 스킵 (null, undefined)
    if (value === null || value === undefined) return;

    // 2. 배열 처리 (이미지 배열이나 문자열 배열 등)
    if (Array.isArray(value)) {
      value.forEach((item) => {
        // 배열 안의 요소가 파일인 경우와 일반 값인 경우 모두 대응
        if (item instanceof File) {
          formData.append(key, item);
        } else {
          formData.append(key, String(item));
        }
      });
      return;
    }

    // 3. 단일 파일 처리
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    // 4. 나머지 일반 값 처리 (숫자, 불리언 등은 문자열로 변환)
    formData.append(key, String(value));
  });

  return formData;
};