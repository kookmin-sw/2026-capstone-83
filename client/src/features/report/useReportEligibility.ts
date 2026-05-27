import { useCallback } from 'react';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { useUserProfileStore } from 'entities/user/model/store/userProfileStore';

/**
 * 로그인한 일반 회원이 해당 userId를 신고할 수 있는지 판별 (목록 등에서 여러 id에 재사용).
 */
export function useReportEligibility() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);
  const myUserId = useUserProfileStore((s) => s.profile?.userId);

  return useCallback(
    (targetUserId: number | null | undefined) => {
      if (!isLoggedIn || !targetUserId) return false;
      if (role === 'MANAGER') return false;
      if (myUserId != null && myUserId === targetUserId) return false;
      return true;
    },
    [isLoggedIn, role, myUserId],
  );
}
