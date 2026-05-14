import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchMockSchedules } from 'entities/schedule/api/schedule.api';
import type { Schedule, ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { ScheduleChip } from 'entities/schedule/ui/ScheduleChip';
import { BaseMonthlyCalendar } from 'widgets/calendar/BaseMonthlyCalendar';
import { ApplicantWeeklyCalendarCards } from './ApplicantWeeklyCalendarCards';
import { HiredWeeklyTimetable } from './HiredWeeklyTimetable';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import type { ApplyStatus } from 'entities/jobPost/model/types/jobPost.type';
import type { BadgeScheme } from 'shared/types/theme';

type ViewMode = 'monthly' | 'weekly';

const CALENDAR_APPLY_STATUS: Record<ApplyStatus, { label: string; scheme: BadgeScheme } | null> = {
  NONE: null,
  APPLYING: { label: '지원 중', scheme: 'primary' },
  SELECTED: { label: '승인 대기', scheme: 'neutral' },
  HIRED: { label: '채용 확정', scheme: 'success' },
  REJECTED: { label: '지원 종료', scheme: 'error' },
};

export const ApplicantCalendarWidget = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const setSelectedJobPostId = useScheduleStore((s) => s.setSelectedJobPostId);

  useEffect(() => {
    fetchMockSchedules().then((data) => {
      const loadedSchedules = data.schedules as Record<string, Schedule[]>;
      setSchedules(loadedSchedules);
      setIsLoading(false);

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const todaySchedules = loadedSchedules[todayStr];
      if (todaySchedules && todaySchedules.length > 0) {
        setSelectedJobPostId(todaySchedules[0].jobPostId);
      }
    });
  }, [setSelectedJobPostId]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'monthly') {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentDate(next);
  };

  if (isLoading) return <Loading message="캘린더를 불러오는 중..." />;

  return (
    <S.Wrapper>
      {viewMode === 'monthly' ? (
        <BaseMonthlyCalendar
          schedules={schedules}
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onNavigate={setCurrentDate}
          viewMode={viewMode}
          onViewChange={setViewMode}
          renderChip={(schedule, { isOtherMonth, fullDate }) => {
            const applicantSchedule = schedule as ApplicantSchedule;
            const statusInfo = CALENDAR_APPLY_STATUS[applicantSchedule.applyStatus || 'NONE'];

            return (
              <ScheduleChip
                schedule={schedule}
                badge={statusInfo ? (
                  <Badge scheme={statusInfo.scheme}>
                    {statusInfo.label}
                  </Badge>
                ) : null}
                onSelect={isOtherMonth ? () => {
                  const [y, m] = fullDate.split('-').map(Number);
                  setCurrentDate(new Date(y, m - 1, 1));
                } : undefined}
              />
            );
          }}
        />
      ) : (
        <>
          <ApplicantWeeklyCalendarCards
            schedules={schedules as Record<string, ApplicantSchedule[]>}
            currentDate={currentDate}
            onPrev={handlePrev}
            onNext={handleNext}
            viewMode={viewMode}
            onViewChange={setViewMode}
          />
          <S.TimetableSection>
            <HiredWeeklyTimetable
              schedules={schedules as Record<string, ApplicantSchedule[]>}
              currentDate={currentDate}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          </S.TimetableSection>
        </>
      )}
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    padding: 32px;
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
  `,
  TimetableSection: styled.div`
    margin-top: 32px;
    padding-top: 32px;
    border-top: 1px solid ${({ theme }) => theme.color.border};
  `,
};
