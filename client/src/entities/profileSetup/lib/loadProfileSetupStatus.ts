import { useAuthStore } from 'entities/auth/model/store/authStore';
import { fetchResumeExists } from 'entities/resume/api/resume.api';
import { fetchWorkplaceExists } from 'entities/workplace/api/workplace.api';
import type { UserType } from 'entities/user/model/types/user.type';
import { useProfileSetupStore } from '../model/store/profileSetupStore';

export const loadProfileSetupStatus = async (role: UserType) => {
  const store = useProfileSetupStore.getState();

  if (role === 'MANAGER') {
    store.clearProfileSetup();
    return;
  }

  try {
    if (role === 'APPLICANT') {
      const { exists } = await fetchResumeExists();
      store.setHasResume(exists);
    }

    if (role === 'EMPLOYER') {
      const { exists } = await fetchWorkplaceExists();
      store.setHasWorkplace(exists);
    }

    store.setLoaded(true);
  } catch (error) {
    console.error('프로필 준비 상태 조회 실패:', error);
    store.setLoaded(false);
    throw error;
  }
};

export const refreshProfileSetupStatus = async (role?: UserType | null) => {
  const resolvedRole = role ?? useAuthStore.getState().role;
  if (!resolvedRole) return;
  await loadProfileSetupStatus(resolvedRole);
};
