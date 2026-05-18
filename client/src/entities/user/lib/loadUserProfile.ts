import { fetchMyProfile } from '../api/user.api';
import { useUserProfileStore } from '../model/store/userProfileStore';

/** 로그인·세션 복구 후 프로필 조회 → 전역 스토어 반영 */
export const loadUserProfile = async () => {
  const profile = await fetchMyProfile();
  useUserProfileStore.getState().setProfile(profile);
  return profile;
};
