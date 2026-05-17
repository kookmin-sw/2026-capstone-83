import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WorkplaceState {
  selectedWorkplaceId: number | null;
  setSelectedWorkplaceId: (id: number | null) => void;
}

export const useWorkplaceStore = create<WorkplaceState>()(
  persist(
    (set) => ({
      selectedWorkplaceId: null,
      setSelectedWorkplaceId: (id) => set({ selectedWorkplaceId: id }),
    }),
    { name: 'workplace-store' }
  )
);
