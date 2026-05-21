
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { logout, refresh, signup } from 'entities/auth/api/auth.api';
import { loginWithFallback } from 'entities/auth/lib/loginWithFallback';
import { loadUserProfile } from 'entities/user/lib/loadUserProfile';
import { useUserProfileStore } from 'entities/user/model/store/userProfileStore';
import { useAuthStore } from '../store/authStore';


export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginWithFallback,
    onSuccess: async (data) => {
      setAuth(data.accessToken, data.role);
      try {
        await loadUserProfile();
      } catch (error) {
        console.error('프로필 조회 실패:', error);
      }
      if (data.role === 'MANAGER') {
        navigate('/admin');
        return;
      }
      navigate('/');
    },
  });
};

export const useRefresh = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: refresh,
    onSuccess: (data) => {
      // role은 로그인 시 받아 store에 보관 중인 값을 그대로 사용
      const currentRole = useAuthStore.getState().role;
      if (currentRole) {
        setAuth(data.accessToken, currentRole);
      }
    },
    onError: () => {
      // 리프레시 실패 시 (세션 만료 등) 전역 상태 비우기
      useAuthStore.getState().clearAuth();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      clearAuth();
      useUserProfileStore.getState().clearProfile();
      queryClient.clear();
    },
  });
};