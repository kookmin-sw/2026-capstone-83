import type { Gender, UserProfile, UserProfileFormValues, UserProfileUpdateRequest } from '../model/types/userProfile.type';

const normalizeBirth = (birth: string | null): string => {
  if (!birth) return '';
  return birth.trim().replace(/\//g, '-').slice(0, 10);
};

export const profileToFormValues = (profile: UserProfile): UserProfileFormValues => ({
  name: profile.name,
  phone: profile.phone,
  birth: normalizeBirth(profile.birth),
  gender: profile.gender ?? 'MALE',
  location: profile.location,
});

export const formValuesToUpdateRequest = (
  values: UserProfileFormValues
): UserProfileUpdateRequest => ({
  name: values.name,
  phone: values.phone,
  birth: values.birth,
  gender: values.gender as Gender,
  location: values.location,
});

export const ROLE_LABEL: Record<UserProfile['role'], string> = {
  APPLICANT: '구직자',
  EMPLOYER: '고용주',
  MANAGER: '매니저',
};
