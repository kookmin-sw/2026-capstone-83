import { create } from 'zustand';
import type { Schedule } from '../types/schedule.type';

interface ScheduleState {
  selectedJobPostId: number | null;
  setSelectedJobPostId: (id: number | null) => void;
  schedules: Record<string, Schedule[]>;
  setSchedules: (schedules: Record<string, Schedule[]>) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  selectedJobPostId: null,
  setSelectedJobPostId: (id) => set({ selectedJobPostId: id }),
  schedules: {},
  setSchedules: (schedules) => set({ schedules }),
}));
