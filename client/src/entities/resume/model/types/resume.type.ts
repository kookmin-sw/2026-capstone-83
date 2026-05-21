


export type EducationLevel =
  // | 'ELEMENTARY'    // 초등학교
  // | 'MIDDLE'        // 중학교
  | 'HIGH'          // 고등학교
  | 'COLLEGE'   // 대학(2,3년제)
  | 'UNIVERSITY' // 대학(4년제)
  | 'GRADUATE'; // 대학원

// 2. 학적 상태 타입
export type SchoolStatus =
  | 'GRADUATED'       // 졸업
  | 'ENROLLED'        // 재학중
  | 'EXPECTED'
  | 'LEAVE' // 휴학중
  | 'DROPPED';        // 중퇴


export interface AcademicBackground {
  educationLevel: EducationLevel | null;
  schoolStatus: SchoolStatus | null;
  major?: string;

}

export interface CareerRequest {
  jobTitle: string;
  years?: number;
  months?: number;
}

// export interface Career {
//   academicBackground?: AcademicBackground;
//   matchCount: number; // 앱 매칭 횟수
//   careers?: CareerItem[];
// }

// export interface Resume extends User {
//   career: Career;
// }

export interface ResumeRequest {
  education: EducationLevel;
  educationStatus: SchoolStatus;
  major: string;
}

export interface Career {
  id: number;
  jobTitle: string;
  years: number;
  months: number;
}

import type { CertificateResponse } from 'shared/types/certificate';

export interface ResumeResponse {
  id?: number;
  resumeId?: number;
  userId?: number;
  name: string;
  gender: string;
  birthDate?: string;
  birthdate?: string;
  address?: string;
  location?: string;
  phone: string;
  email: string;
  profileUrl?: string;
  profileImageUrl?: string;
  education: EducationLevel;
  educationStatus: SchoolStatus;
  major: string;
  totalHired: number;
  liked: boolean;
  careers: Career[];
  certificates: CertificateResponse[];
}

import type { CursorParams, CursorResponse } from 'shared/api/types';

export interface ResumeCardItem {
  resumeId: number;
  userId?: number;
  profileImageUrl: string;
  name: string;
  gender: string;
  age: number;
  liked: boolean;
  firstCareerTitle: string | null;
  firstCareerYears: number;
  firstCareerMonths: number;
  location: string;
  totalHired: number;
}

export type ResumeListCursor = CursorResponse<ResumeCardItem>;

export type GetResumesParams = CursorParams;
