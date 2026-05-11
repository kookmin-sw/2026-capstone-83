
import type { AxiosRequestConfig } from 'axios';
import axios from 'axios';
import { refresh } from 'entities/auth/api/auth.api';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import qs from 'qs';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const DEFAULT_TIMEOUT = import.meta.env.VITE_TIMEOUT
  ? parseInt(import.meta.env.VITE_TIMEOUT)
  : 30000;

export const createClient = (config?: AxiosRequestConfig) => {
  return axios.create({
    baseURL: BASE_URL,
    timeout: DEFAULT_TIMEOUT,

    withCredentials: true,
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: 'repeat' }),
    ...config,
  });
};

export const httpClient = createClient(); // 공개 API용 (인터셉터 없음)
export const authClient = createClient(); // 인증 API용

/**
 * 요청 인터셉터: 
 * authClient를 사용할 때 자동으로 스토어의 토큰을 헤더에 삽입
 */
authClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 응답 인터셉터: 401 에러 시 토큰 갱신 시도
 */
authClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // refresh 함수는 인터셉터가 없는 httpClient를 사용해야 무결성이 유지
        const { accessToken } = await refresh();

        // role은 로그인 시 받아 store에 보관된 값을 그대로 유지
        const currentRole = useAuthStore.getState().role;
        if (currentRole) {
          useAuthStore.getState().setAuth(accessToken, currentRole);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // 주의: 여기서 authClient(originalRequest)를 호출해야 새 토큰이 적용된
        // 요청 인터셉터를 거치거나 직접 헤더가 박힌 채로 재전송
        return authClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);


