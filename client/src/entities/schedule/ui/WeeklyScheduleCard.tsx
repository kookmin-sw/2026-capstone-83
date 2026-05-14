import { Clock } from 'lucide-react';
import type { Schedule } from '../model/types/schedule.type';
import { useScheduleStore } from '../model/store/scheduleStore';
import Badge from 'shared/ui/Badge/Badge';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import * as CS from 'widgets/calendar/styles/calendar.styled';

interface Props {
  schedule: Schedule;
}

export const WeeklyScheduleCard = ({ schedule }: Props) => {
  const { jobPostId, title, workStart, workEnd, filledSlots, totalSlots, postStatus } = schedule;
  const isClosed = postStatus === 'CLOSED';

  const selectedId = useScheduleStore((s) => s.selectedJobPostId);
  const setSelectedId = useScheduleStore((s) => s.setSelectedJobPostId);
  const isSelected = selectedId === jobPostId;

  const handleClick = () => {
    setSelectedId(isSelected ? null : jobPostId);
  };

  return (
    <CS.ScheduleCardBase $selected={isSelected} onClick={handleClick}>
      <CS.BadgeRow>
        <Badge scheme={isClosed ? 'warning' : 'primary'}>
          {isClosed ? '모집 완료' : '모집 중'}
        </Badge>
      </CS.BadgeRow>
      <CS.CardTitle>{title}</CS.CardTitle>
      <CS.CardMeta><Clock size={12} /> {workStart} - {workEnd}</CS.CardMeta>
      <CS.ProgressRow>
        <span className="confirmed">확정 {filledSlots}</span>
        <span className="total">모집 {totalSlots}</span>
      </CS.ProgressRow>
      <ProgressBar total={totalSlots} current={filledSlots} height="6px" fontSize="10px" />
    </CS.ScheduleCardBase>
  );
};
