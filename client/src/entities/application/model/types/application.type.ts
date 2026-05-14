import type { CursorResponse } from 'shared/api/types';

export type ApplicationStatus = 'APPLIED' | 'HIRED' | 'REJECTED' | 'OFFERED' | 'PENDING';

export interface ApplicationResponse {
  applicationId: number;
  jobPostId: number;
  title: string;
  company: string;
  status: ApplicationStatus;
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