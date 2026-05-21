import { isAxiosError } from 'axios';

/** API ErrorResponse.message 추출 (없으면 fallback) */
export const getApiErrorMessage = (
  error: unknown,
  fallback = '요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.',
): string => {
  if (isAxiosError(error) && error.response?.data && typeof error.response.data === 'object') {
    const message = (error.response.data as { message?: string }).message;
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
  }
  return fallback;
};
