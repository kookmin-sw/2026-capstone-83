import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  fetchMyProfile,
  updateMyProfile,
  updateProfileImage,
} from '../../api/user.api';
import { useUserProfileStore } from '../store/userProfileStore';
import type { PasswordChangeRequest, UserProfileUpdateRequest } from '../types/userProfile.type';

export const USER_PROFILE_QUERY_KEY = ['user', 'me', 'profile'] as const;

export const useMyProfile = () => {
  const setProfile = useUserProfileStore((s) => s.setProfile);

  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: async () => {
      const profile = await fetchMyProfile();
      setProfile(profile);
      return profile;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  const setProfile = useUserProfileStore((s) => s.setProfile);

  return useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => updateMyProfile(data),
    onSuccess: (profile) => {
      setProfile(profile);
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: PasswordChangeRequest) => changePassword(data),
  });
};

export const useUpdateProfileImage = () => {
  const queryClient = useQueryClient();
  const setProfile = useUserProfileStore((s) => s.setProfile);

  return useMutation({
    mutationFn: (image: File) => updateProfileImage(image),
    onSuccess: (profile) => {
      setProfile(profile);
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });
};
