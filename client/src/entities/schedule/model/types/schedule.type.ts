import type { ApplicationStatus } from 'entities/application/model/types/application.type';
import type { PostStatus } from 'entities/jobPost/model/types/jobPost.type';



export interface Schedule {
  date: string;
  jobPostId: number;
  title: string;
  workStart: string;
  workEnd: string;
  filledSlots: number;
  totalSlots: number;
  postStatus?: PostStatus;
  /** 고용주 캘린더 API */
  workplaceId?: number;
  workplace?: string;
  applicantCount?: number;
  hiredCount?: number;
}



// export interface EmployerSchedule extends Schedule {

//   filledSlots: number;
//   totalSlots: number;

// }

export interface ApplicantSchedule extends Schedule {
  company?: string;
  location?: string;
  /** 서버 worker/schedule API — ApplicationStatus (APPLIED, PENDING, HIRED 등) */
  applyStatus?: ApplicationStatus;
}



export interface ScheduleRequest {
  fromDate: string;
  toDate: string;
}

export interface ScheduleResponse {
  startDate: string;
  endDate: string;
  schedules: Record<string, Schedule[]>;
}
