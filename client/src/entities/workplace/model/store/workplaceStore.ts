import { create } from 'zustand';

interface WorkplaceState {
  selectedWorkplaceId: number | null; // null = 전체
  setSelectedWorkplaceId: (id: number | null) => void;
}

export const useWorkplaceStore = create<WorkplaceState>((set) => ({
  selectedWorkplaceId: null,
  setSelectedWorkplaceId: (id) => set({ selectedWorkplaceId: id }),
}));
