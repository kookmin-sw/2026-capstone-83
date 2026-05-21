import type { ResumeCardItem, ResumeResponse } from '../model/types/resume.type';

/** mock/상세(ResumeResponse) → 목록 카드(ResumeCardResponse) 변환 */
export function toResumeCardItem(
  resume: ResumeResponse & { id?: number; resumeId?: number },
): ResumeCardItem {
  const first = resume.careers?.[0];
  const birthRaw = resume.birthDate ?? resume.birthdate;
  const birthYear = birthRaw ? new Date(birthRaw).getFullYear() : 0;
  const age = birthYear ? new Date().getFullYear() - birthYear + 1 : 0;

  return {
    resumeId: resume.resumeId ?? resume.id ?? 0,
    userId: resume.userId,
    profileImageUrl: resume.profileUrl ?? resume.profileImageUrl ?? '',
    name: resume.name,
    gender: resume.gender,
    age,
    liked: resume.liked ?? false,
    firstCareerTitle: first?.jobTitle ?? null,
    firstCareerYears: first?.years ?? 0,
    firstCareerMonths: first?.months ?? 0,
    location: resume.address ?? resume.location ?? '',
    totalHired: resume.totalHired ?? 0,
  };
}
