
import { useEffect, useState } from 'react';
import { refresh } from 'entities/auth/api/auth.api';
import { useAuthStore } from 'entities/auth/model/store/authStore';

export const useAuthInit = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 앱이 시작될 때 리프레시 토큰으로 세션 복구 시도
        const data = await refresh();
        setAuth(data.accessToken, data.role);
      } catch (error) {
        // 쿠키가 없거나 만료된 경우 조용히 초기화
        clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth]);

  return { isInitializing };
};