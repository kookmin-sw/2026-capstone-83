import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ensureHasWorkplaceForJobPostCreate } from 'entities/profileSetup/lib/jobPostCreateNavigation';

export const useWorkplaceRequiredForJobPost = () => {
  const navigate = useNavigate();
  const [isNoWorkplaceModalOpen, setIsNoWorkplaceModalOpen] = useState(false);

  const runWithWorkplaceCheck = useCallback(async (action: () => void) => {
    const canCreate = await ensureHasWorkplaceForJobPostCreate();
    if (!canCreate) {
      setIsNoWorkplaceModalOpen(true);
      return;
    }
    action();
  }, []);

  const closeNoWorkplaceModal = useCallback(() => {
    setIsNoWorkplaceModalOpen(false);
  }, []);

  const confirmNoWorkplaceModal = useCallback(() => {
    setIsNoWorkplaceModalOpen(false);
    navigate('/dashboard/workplace');
  }, [navigate]);

  return {
    isNoWorkplaceModalOpen,
    runWithWorkplaceCheck,
    closeNoWorkplaceModal,
    confirmNoWorkplaceModal,
  };
};
