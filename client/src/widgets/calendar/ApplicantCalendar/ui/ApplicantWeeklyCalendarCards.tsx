import { Clock, MapPin } from 'lucide-react';
import type { ApplicantSchedule, Schedule } from 'entities/schedule/model/types/schedule.type';
import type { ApplyStatus } from 'entities/jobPost/model/types/jobPost.type';
import type { BadgeScheme } from 'shared/types/theme';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { BaseWeeklyCalendar } from 'widgets/calendar/BaseWeeklyCalendar';
import * as CS from 'widgets/calendar/styles/calendar.styled';
import Badge from 'shared/ui/Badge/Badge';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';

type ViewMode = 'monthly' | 'weekly';

interface Props {
  schedules: Record<string, ApplicantSchedule[]>;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const CALENDAR_APPLY_STATUS: Record<ApplyStatus, { label: string; scheme: BadgeScheme } | null> = {
  NONE: null,
  APPLYING: { label: '지원 중', scheme: 'primary' },
  SELECTED: { label: '승인 대기', scheme: 'neutral' },
  HIRED: { label: '채용 확정', scheme: 'success' },
  REJECTED: { label: '지원 종료', scheme: 'error' },
};

export const ApplicantWeeklyCalendarCards = ({ schedules, currentDate, onPrev, onNext, viewMode, onViewChange }: Props) => {
  const selectedId = useScheduleStore((s) => s.selectedJobPostId);
  const setSelectedId = useScheduleStore((s) => s.setSelectedJobPostId);

  return (
    <BaseWeeklyCalendar
      schedules={schedules as Record<string, Schedule[]>}
      currentDate={currentDate}
      onPrev={onPrev}
      onNext={onNext}
      viewMode={viewMode}
      onViewChange={onViewChange}
      renderCard={(schedule) => {
        const s = schedule as ApplicantSchedule;
        const isSelected = selectedId === s.jobPostId;
        const statusInfo = CALENDAR_APPLY_STATUS[s.applyStatus || 'NONE'];

        return (
          <CS.ScheduleCardBase
            key={s.jobPostId}
            $selected={isSelected}
            onClick={() => setSelectedId(isSelected ? null : s.jobPostId)}
          >
            {statusInfo && (
              <CS.BadgeRow>
                <Badge scheme={statusInfo.scheme}>{statusInfo.label}</Badge>
              </CS.BadgeRow>
            )}
            <CS.CardTitle>{s.title}</CS.CardTitle>
            <CS.CardMeta><Clock size={12} /> {s.workStart} - {s.workEnd}</CS.CardMeta>
            {s.location && <CS.CardMeta><MapPin size={12} /> {s.location}</CS.CardMeta>}
            <CS.ProgressRow>
              <span className="confirmed">확정 {s.filledSlots}</span>
              <span className="total">모집 {s.totalSlots}</span>
            </CS.ProgressRow>
            <ProgressBar total={s.totalSlots} current={s.filledSlots} height="6px" fontSize="10px" />
          </CS.ScheduleCardBase>
        );
      }}
    />
  );
};
