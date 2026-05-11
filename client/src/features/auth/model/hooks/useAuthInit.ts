
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

        // role은 persist된 store에서 가져와 사용 (refresh 응답엔 role 없음)
        const currentRole = useAuthStore.getState().role;
        if (currentRole) {
          setAuth(data.accessToken, currentRole);
        } else {
          // 이전 세션 정보가 없으면 토큰만 있어도 의미 없음 — 초기화
          clearAuth();
        }
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