import axios from 'axios';
import { login } from '../api/auth.api';
import type { LoginRequest } from '../model/types/auth.type';

const isRoleMismatchError = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) return false;
  const message = error.response?.data?.message ?? error.response?.data?.error;
  if (typeof message === 'string') {
    return message.includes('회원 유형');
  }
  return false;
};

/** 탭 role 불일치 시 role 없이 재시도 (관리자·역할 검증 생략 계정용) */
export const loginWithFallback = async (data: LoginRequest) => {
  try {
    return await login(data);
  } catch (error) {
    if (data.role && isRoleMismatchError(error)) {
      const { role: _role, ...withoutRole } = data;
      return login(withoutRole);
    }
    throw error;
  }
};
