import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProfileSetupState {
  hasResume: boolean | null;
  hasWorkplace: boolean | null;
  isLoaded: boolean;
  setHasResume: (exists: boolean) => void;
  setHasWorkplace: (exists: boolean) => void;
  setLoaded: (loaded: boolean) => void;
  clearProfileSetup: () => void;
}

const initialState = {
  hasResume: null as boolean | null,
  hasWorkplace: null as boolean | null,
  isLoaded: false,
};

export const useProfileSetupStore = create<ProfileSetupState>()(
  persist(
    (set) => ({
      ...initialState,
      setHasResume: (exists) => set({ hasResume: exists }),
      setHasWorkplace: (exists) => set({ hasWorkplace: exists }),
      setLoaded: (loaded) => set({ isLoaded: loaded }),
      clearProfileSetup: () => set({ ...initialState }),
    }),
    {
      name: 'profile-setup-storage',
      partialize: (state) => ({
        hasResume: state.hasResume,
        hasWorkplace: state.hasWorkplace,
      }),
    },
  ),
);
