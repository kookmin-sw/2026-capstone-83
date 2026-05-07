
import type { UserType } from 'entities/user/model/types/user.type';
import { create } from 'zustand';
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null;
  role: UserType | null;
  setAuth: (accessToken: string, role: UserType) => void;
  clearAuth: () => void;
  isLoggedIn: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      role: null,
      isLoggedIn: false,
      setAuth: (accessToken, role) =>
        set({ accessToken, role, isLoggedIn: !!accessToken }),
      clearAuth: () =>
        set({ accessToken: null, role: null, isLoggedIn: false }),
    }),
    {
      name: 'auth-storage',
      // partialize를 사용하여 저장할 필드만 선택
      partialize: (state) => ({
        role: state.role,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);