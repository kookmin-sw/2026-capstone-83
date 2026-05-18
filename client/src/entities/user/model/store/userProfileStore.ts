import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '../types/userProfile.type';

interface UserProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  clearProfile: () => void;
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'user-profile-storage',
      partialize: (state) => ({
        profile: state.profile
          ? {
              userId: state.profile.userId,
              name: state.profile.name,
              profileImageUrl: state.profile.profileImageUrl,
              role: state.profile.role,
            }
          : null,
      }),
    }
  )
);

export const getProfileAvatarUrl = (profile: UserProfile | null): string => {
  if (profile?.profileImageUrl) return profile.profileImageUrl;
  if (profile?.name) {
    return `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(profile.name)}`;
  }
  return 'https://api.dicebear.com/7.x/identicon/svg?seed=default';
};
