import { refreshProfileSetupStatus } from './loadProfileSetupStatus';
import { useProfileSetupStore } from '../model/store/profileSetupStore';

export const ensureHasWorkplaceForJobPostCreate = async (): Promise<boolean> => {
  await refreshProfileSetupStatus();
  return useProfileSetupStore.getState().hasWorkplace === true;
};

export const buildJobPostCreateUrl = (params?: {
  workDate?: string;
  workplaceId?: number;
}) => {
  const search = new URLSearchParams();
  if (params?.workDate) search.set('workDate', params.workDate);
  if (params?.workplaceId != null) search.set('workplaceId', String(params.workplaceId));
  const query = search.toString();
  return query ? `/jobpost/create?${query}` : '/jobpost/create';
};

export const openJobPostCreatePage = async (params?: {
  workDate?: string;
  workplaceId?: number;
}) => {
  const canCreate = await ensureHasWorkplaceForJobPostCreate();
  if (!canCreate) {
    window.location.href = '/dashboard/workplace';
    return false;
  }

  window.open(buildJobPostCreateUrl(params), '_blank');
  return true;
};
