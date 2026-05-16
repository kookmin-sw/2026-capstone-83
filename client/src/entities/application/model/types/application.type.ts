import type { CursorResponse } from 'shared/api/types';
import type { JobPost } from 'entities/jobPost/model/types/jobPost.type';

export type ApplicationStatus = 'APPLIED' | 'HIRED' | 'REJECTED' | 'OFFERED' | 'PENDING';

export interface ApplicationResponse {
  applicationId: number;
  jobPostId: number;
  title: string;
  company: string;
  status: ApplicationStatus;
  appliedAt: string;
}

/** 구직자 지원 목록 항목 (공고 정보 + 지원 상태) */
export interface ApplicationWithJobPost extends JobPost {
  applicationId: number;
  applicationStatus: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicantResponse {
  userId: number;
  name: string;
  phone: string;
  profileImageUrl: string;
  gender: string;
  age: number;
  location: string;
  matchCount: number;
  status: ApplicationStatus;
  appliedAt: string;
}

export type ApplicantListCursor = CursorResponse<ApplicantResponse>;
export type ApplicationListCursor = CursorResponse<ApplicationResponse>;