
import { useEffect, useState } from 'react';
import { refresh } from 'entities/auth/api/auth.api';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { loadUserProfile } from 'entities/user/lib/loadUserProfile';
import { loadProfileSetupStatus } from 'entities/profileSetup/lib/loadProfileSetupStatus';
import { useProfileSetupStore } from 'entities/profileSetup/model/store/profileSetupStore';
import { useUserProfileStore } from 'entities/user/model/store/userProfileStore';

export const useAuthInit = () => {
  const [isInitializing, setIsInitializing] = useState(true);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const clearProfile = useUserProfileStore((state) => state.clearProfile);
  const clearProfileSetup = useProfileSetupStore((state) => state.clearProfileSetup);

  useEffect(() => {
    const initAuth = async () => {
      try {
        // 앱이 시작될 때 리프레시 토큰으로 세션 복구 시도
        const data = await refresh();

        // role은 persist된 store에서 가져와 사용 (refresh 응답엔 role 없음)
        const currentRole = useAuthStore.getState().role;
        if (currentRole) {
          setAuth(data.accessToken, currentRole);
          try {
            await loadUserProfile();
            await loadProfileSetupStatus(currentRole);
          } catch {
            // 프로필 조회 실패 시에도 로그인 세션은 유지
          }
        } else {
          // 이전 세션 정보가 없으면 토큰만 있어도 의미 없음 — 초기화
          clearAuth();
          clearProfile();
          clearProfileSetup();
        }
      } catch (error) {
        clearAuth();
        clearProfile();
        clearProfileSetup();
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setAuth, clearAuth, clearProfile, clearProfileSetup]);

  return { isInitializing };
};