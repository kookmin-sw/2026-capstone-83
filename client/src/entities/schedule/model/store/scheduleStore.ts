import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Schedule } from '../types/schedule.type';

interface ScheduleState {
  selectedJobPostId: number | null;
  setSelectedJobPostId: (id: number | null) => void;
  schedules: Record<string, Schedule[]>;
  setSchedules: (schedules: Record<string, Schedule[]>) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      selectedJobPostId: null,
      setSelectedJobPostId: (id) => set({ selectedJobPostId: id }),
      schedules: {},
      setSchedules: (schedules) => set({ schedules }),
    }),
    {
      name: 'schedule-store',
      partialize: (state) => ({ selectedJobPostId: state.selectedJobPostId }),
    }
  )
);
