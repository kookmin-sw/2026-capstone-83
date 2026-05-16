import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchMockSchedules } from 'entities/schedule/api/schedule.api';
import type { Schedule } from 'entities/schedule/model/types/schedule.type';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { useWorkplaceStore } from 'entities/workplace/model/store/workplaceStore';
import { ScheduleChip } from 'entities/schedule/ui/ScheduleChip';
import { BaseMonthlyCalendar } from 'widgets/calendar/BaseMonthlyCalendar';
import { WeeklyCalendar } from './WeeklyCalendar';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import { USE_MOCK } from 'shared/config/env';

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
  const [schedules, setSchedules] = useState<Record<string, Schedule[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const setSelectedJobPostId = useScheduleStore((s) => s.setSelectedJobPostId);
  const selectedWpId = useWorkplaceStore((s) => s.selectedWorkplaceId);

  useEffect(() => {
    const load = async () => {
      const mock = USE_MOCK ? await fetchMockSchedules() : null;
      // TODO: 실제 API 연동 시 fetchSchedules(workplaceId, { fromDate, toDate }) 호출 추가
      const loadedSchedules = (mock?.schedules || {}) as Record<string, Schedule[]>;
      setSchedules(loadedSchedules);
      setIsLoading(false);

      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const todaySchedules = loadedSchedules[todayStr];
      if (todaySchedules && todaySchedules.length > 0) {
        setSelectedJobPostId(todaySchedules[0].jobPostId);
      }
    };
    load();
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
            const isClosed = schedule.postStatus === 'CLOSED';
            return (
              <ScheduleChip
                schedule={schedule}
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
              const wpParam = selectedWpId ? `&workplaceId=${selectedWpId}` : '';
              window.open(`/jobpost/create?workDate=${fullDate}${wpParam}`, '_blank');
            }}>
              + 공고 추가
            </AddButton>
          )}
          renderModalFooter={(fullDate) => (
            <ModalAddButton onClick={() => {
              const wpParam = selectedWpId ? `&workplaceId=${selectedWpId}` : '';
              window.open(`/jobpost/create?workDate=${fullDate}${wpParam}`, '_blank');
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
};
