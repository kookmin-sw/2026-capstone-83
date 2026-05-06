

export interface Schedule {
  date: string;
  jobPostId: number;
  title: string;
  workStart: string;
  workEnd: string;
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