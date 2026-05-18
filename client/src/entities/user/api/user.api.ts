import { authClient } from 'shared/api/httpClient';
import type {
  PasswordChangeRequest,
  UserProfile,
  UserProfileUpdateRequest,
} from '../model/types/userProfile.type';

/** 내 회원정보 조회 */
export const fetchMyProfile = async (): Promise<UserProfile> => {
  const response = await authClient.get<UserProfile>('/api/v1/users/me');
  return response.data;
};

/** 내 회원정보 수정 */
export const updateMyProfile = async (data: UserProfileUpdateRequest): Promise<UserProfile> => {
  const response = await authClient.put<UserProfile>('/api/v1/users/me', data);
  return response.data;
};

/** 비밀번호 변경 */
export const changePassword = async (data: PasswordChangeRequest): Promise<void> => {
  await authClient.put('/api/v1/users/me/password', data);
};

/** 프로필 이미지 업로드 */
export const updateProfileImage = async (image: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('image', image);
  const response = await authClient.post<UserProfile>('/api/v1/users/me/profile-image', formData);
  return response.data;
};
