import { create } from 'zustand';

interface ScheduleState {
  selectedJobPostId: number | null;
  setSelectedJobPostId: (id: number | null) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  selectedJobPostId: null,
  setSelectedJobPostId: (id) => set({ selectedJobPostId: id }),
}));
