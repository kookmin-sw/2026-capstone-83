import type { CursorResponse } from 'shared/api/types';
import type { ApplyStatus, JobPost, PostStatus, WageType } from 'entities/jobPost/model/types/jobPost.type';

export type ApplicationStatus = 'APPLIED' | 'HIRED' | 'REJECTED' | 'OFFERED' | 'PENDING' | 'COMPLETED';

/** GET /worker/applications 응답의 jobPost 필드 */
export interface JobPostInApplicationResponse {
  id: number;
  title: string;
  company: string;
  companyLogoUrl?: string | null;
  location: string;
  wage: number;
  wageType: string;
  totalSlots: number;
  filledSlots: number;
  workDate: string;
  workStart: string;
  workEnd: string;
  leftDays: number;
  status: string;
  deadline: string;
  jobCategory?: string;
  jobSubcategory?: string;
  liked: boolean;
}

/** GET /worker/applications 응답 항목 */
export interface ApplicationResponse {
  applicationId: number;
  status: ApplicationStatus;
  appliedAt: string | null;
  jobPost: JobPostInApplicationResponse;
}

export function applicationStatusToApplyStatus(status: ApplicationStatus): ApplyStatus {
  switch (status) {
    case 'APPLIED':
      return 'APPLYING';
    case 'OFFERED':
    case 'PENDING':
      return 'SELECTED';
    case 'HIRED':
    case 'COMPLETED':
      return 'HIRED';
    case 'REJECTED':
      return 'REJECTED';
    default:
      return 'NONE';
  }
}

/** API 응답 → JobPostCard 렌더용 타입 */
export function toApplicationWithJobPost(item: ApplicationResponse): ApplicationWithJobPost {
  const { jobPost, status, applicationId, appliedAt } = item;

  return {
    id: jobPost.id,
    title: jobPost.title,
    company: jobPost.company,
    location: jobPost.location,
    wage: jobPost.wage,
    wageType: jobPost.wageType as WageType,
    totalSlots: jobPost.totalSlots,
    filledSlots: jobPost.filledSlots,
    workDate: jobPost.workDate,
    workStart: jobPost.workStart,
    workEnd: jobPost.workEnd,
    status: jobPost.status as PostStatus,
    applyStatus: applicationStatusToApplyStatus(status),
    deadline: jobPost.deadline,
    liked: jobPost.liked,
    applicationId,
    applicationStatus: status,
    appliedAt: appliedAt ?? '',
  };
}

/** 구직자 지원 목록 항목 (공고 정보 + 지원 상태) */
export interface ApplicationWithJobPost extends JobPost {
  applicationId: number;
  applicationStatus: ApplicationStatus;
  appliedAt: string;
}

export interface ApplicantResponse {
  applicationId: number;
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