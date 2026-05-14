import type { ApplyStatus, PostStatus } from 'entities/jobPost/model/types/jobPost.type';



export interface Schedule {
  date: string;
  jobPostId: number;
  title: string;
  workStart: string;
  workEnd: string;
  filledSlots: number;
  totalSlots: number;
  postStatus?: PostStatus;
}



// export interface EmployerSchedule extends Schedule {

//   filledSlots: number;
//   totalSlots: number;

// }

export interface ApplicantSchedule extends Schedule {
  company?: string;
  location?: string;
  applyStatus?: ApplyStatus;
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
