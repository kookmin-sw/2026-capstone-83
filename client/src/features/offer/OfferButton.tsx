import { useAuthStore } from 'entities/auth/model/store/authStore';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { OfferJobButton } from './OfferJobButton';

interface Props {
  userId: number;
}

/** @deprecated OfferJobButton 사용. jobPostId는 대시보드에서 선택된 공고 사용 */
const OfferButton = ({ userId }: Props) => {
  const role = useAuthStore((s) => s.role);
  const jobPostId = useScheduleStore((s) => s.selectedJobPostId);

  if (role !== 'EMPLOYER' || jobPostId === null) return null;

  return <OfferJobButton jobPostId={jobPostId} userId={userId} />;
};

export default OfferButton;
