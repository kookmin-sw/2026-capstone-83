import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { CalendarSurface } from 'widgets/calendar/styles/calendar.styled';
import type { Schedule } from 'entities/schedule/model/types/schedule.type';
import { useSchedules } from 'entities/schedule/model/hooks/useSchedules';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { useWorkplaceStore } from 'entities/workplace/model/store/workplaceStore';
import { ScheduleChip } from 'entities/schedule/ui/ScheduleChip';
import { BaseMonthlyCalendar } from 'widgets/calendar/BaseMonthlyCalendar';
import { WeeklyCalendar } from './WeeklyCalendar';
import { openJobPostCreatePage } from 'entities/profileSetup/lib/jobPostCreateNavigation';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';

function getMonthDateRange(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    fromDate: `${y}-${pad(m)}-01`,
    toDate: `${y}-${pad(m)}-${pad(lastDay)}`,
  };
}

type ViewMode = 'monthly' | 'weekly';

const AddButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  flex: 1;
  border: 2px dashed ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  background: transparent;
  color: ${({ theme }) => theme.color.subText};
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 4px 2px;
  position: relative;
  z-index: 2;

  div:hover > & {
    display: flex;
  }

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    display: none !important;
  }

  &:hover {
    border-color: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.primary};
  }
`;

const ModalAddButton = styled.button`
  width: 100%;
  padding: 16px;
  margin-top: 8px;
  border: 2px dashed ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: transparent;
  color: ${({ theme }) => theme.color.subText};
  font-size: ${({ theme }) => theme.fontSize.small};
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.primary};
  }
`;

export const EmployerCalendarWidget = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const setSelectedJobPostId = useScheduleStore((s) => s.setSelectedJobPostId);
  const selectedWpId = useWorkplaceStore((s) => s.selectedWorkplaceId);

  const { fromDate, toDate } = useMemo(() => getMonthDateRange(currentDate), [currentDate]);
  const { data, isLoading, isError } = useSchedules(selectedWpId, fromDate, toDate);
  const schedules = (data?.schedules ?? {}) as Record<string, Schedule[]>;

  useEffect(() => {
    if (!data?.schedules) return;

    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    const todaySchedules = data.schedules[todayStr];
    if (todaySchedules?.length) {
      setSelectedJobPostId(todaySchedules[0].jobPostId);
    }
  }, [data, setSelectedJobPostId]);

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
  if (isError) return <Loading message="캘린더를 불러올 수 없습니다." />;

  return (
    <CalendarSurface>
      {viewMode === 'monthly' ? (
        <BaseMonthlyCalendar
          schedules={schedules}
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onNavigate={setCurrentDate}
          viewMode={viewMode}
          onViewChange={setViewMode}
          renderChip={(schedule, { isOtherMonth, fullDate, surface }) => {
            const isClosed = schedule.postStatus === 'CLOSED';
            return (
              <ScheduleChip
                schedule={schedule}
                density={surface === 'modal' ? 'full' : 'compact'}
                badge={
                  <Badge scheme={isClosed ? 'warning' : 'primary'}>
                    {isClosed ? '모집완료' : '모집중'}
                  </Badge>
                }
                onSelect={isOtherMonth ? () => {
                  const [y, m] = fullDate.split('-').map(Number);
                  setCurrentDate(new Date(y, m - 1, 1));
                } : undefined}
              />
            );
          }}
          renderEmptyCell={(fullDate) => (
            <AddButton onClick={(e) => {
              e.stopPropagation();
              void openJobPostCreatePage({
                workDate: fullDate,
                workplaceId: selectedWpId ?? undefined,
              });
            }}>
              + 공고 추가
            </AddButton>
          )}
          renderModalFooter={(fullDate) => (
            <ModalAddButton onClick={() => {
              void openJobPostCreatePage({
                workDate: fullDate,
                workplaceId: selectedWpId ?? undefined,
              });
            }}>
              + 공고 추가
            </ModalAddButton>
          )}
        />
      ) : (
        <WeeklyCalendar
          schedules={schedules}
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />
      )}
    </CalendarSurface>
  );
};

