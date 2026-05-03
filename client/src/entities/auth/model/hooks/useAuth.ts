
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { login, logout, refresh, signup } from 'entities/auth/api/auth.api';
import { useAuthStore } from '../store/authStore';


export const useSignup = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signup,
    onSuccess: () => {
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      navigate('/login');
    },
    onError: (error) => {
      console.error('회원가입 실패:', error);
    },
  });
};

export const useLogin = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // 1. 응답받은 accessToken과 role을 전역 상태에 저장 (데이터 무결성 확보)
      setAuth(data.accessToken, data.role);

      console.log('로그인 성공');
      navigate('/'); // 메인 또는 대시보드로 이동
    },
    onError: (error) => {
      alert('로그인 정보가 일치하지 않습니다.');
      console.error('로그인 실패:', error);
    },
  });
};

export const useRefresh = () => {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: refresh,
    onSuccess: (data) => {
      // 새로운 액세스 토큰으로 갱신
      setAuth(data.accessToken, data.role);
    },
    onError: () => {
      // 리프레시 실패 시 (세션 만료 등) 전역 상태 비우기
      useAuthStore.getState().clearAuth();
    },
  });
};

export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      // 성공 여부와 상관없이 프론트엔드 정보를 지워 무결성을 유지합니다.
      clearAuth();

      // 캐시된 모든 쿼리 무효화 (이전 사용자의 데이터 유출 방지)
      queryClient.clear();

      navigate('/login');
    },
  });
};