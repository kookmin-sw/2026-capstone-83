import type { UserType } from './user.type';

export type Gender = 'MALE' | 'FEMALE';

/** GET /api/v1/users/me */
export interface UserProfile {
  userId: number;
  name: string;
  email: string;
  phone: string;
  birth: string | null;
  gender: Gender | null;
  location: string;
  profileImageUrl: string | null;
  role: UserType;
}

/** PUT /api/v1/users/me — null 필드는 서버에서 기존 값 유지 */
export interface UserProfileUpdateRequest {
  name?: string;
  phone?: string;
  birth?: string;
  gender?: Gender;
  location?: string;
}

/** PUT /api/v1/users/me/password */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UserProfileFormValues {
  name: string;
  phone: string;
  birth: string;
  gender: Gender;
  location: string;
}
