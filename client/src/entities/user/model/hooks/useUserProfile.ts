import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changePassword,
  fetchMyProfile,
  updateMyProfile,
  updateProfileImage,
} from '../../api/user.api';
import type { PasswordChangeRequest, UserProfileUpdateRequest } from '../types/userProfile.type';

export const USER_PROFILE_QUERY_KEY = ['user', 'me', 'profile'] as const;

export const useMyProfile = () => {
  return useQuery({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: fetchMyProfile,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserProfileUpdateRequest) => updateMyProfile(data),
    onSuccess: () => {
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

  return useMutation({
    mutationFn: (image: File) => updateProfileImage(image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });
};
