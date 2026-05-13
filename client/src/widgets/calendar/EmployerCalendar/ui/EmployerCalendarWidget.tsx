import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchMockSchedules } from 'entities/schedule/api/schedule.api';
import type { Schedule } from 'entities/schedule/model/types/schedule.type';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { MonthlyCalendar } from './MonthlyCalendar';
import { WeeklyCalendar } from './WeeklyCalendar';
import Loading from 'shared/ui/Loading/Loading';

type ViewMode = 'monthly' | 'weekly';

export const EmployerCalendarWidget = () => {
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

      // 디폴트 셀렉트: 오늘 날짜의 첫 공고
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
        <MonthlyCalendar
          schedules={schedules}
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onNavigate={setCurrentDate}
          viewMode={viewMode}
          onViewChange={setViewMode}
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
