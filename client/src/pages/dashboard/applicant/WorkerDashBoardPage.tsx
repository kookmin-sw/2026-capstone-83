import { useState } from 'react';
import styled from 'styled-components';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import type { ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import { ApplicantCalendarWidget } from 'widgets/calendar/ApplicantCalendar/ui/ApplicantCalendarWidget';
import { HiredWeeklyTimetable } from 'widgets/calendar/ApplicantCalendar/ui/HiredWeeklyTimetable';
import { ApplicationListByStatus } from 'widgets/application/ApplicationListByStatus';
import { ApplicationsRefreshButton } from 'features/application/ApplicationsRefreshButton';
import SelectedJobPostSection from 'entities/jobPost/ui/SelectedJobPostSection';
import { CalendarSurface } from 'widgets/calendar/styles/calendar.styled';

const WorkerDashBoardPage = () => {
  const schedules = useScheduleStore((s) => s.schedules);
  const selectedJobPostId = useScheduleStore((s) => s.selectedJobPostId);
  const [timetableDate, setTimetableDate] = useState(new Date());

  const handleTimetablePrev = () => {
    setTimetableDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleTimetableNext = () => {
    setTimetableDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  return (
    <S.PageWrapper>
      {/* 캘린더 */}
      <ApplicantCalendarWidget />

      {/* 근무 시간표 (항상 표시) */}
      <CalendarSurface>
        <HiredWeeklyTimetable
          schedules={schedules as Record<string, ApplicantSchedule[]>}
          currentDate={timetableDate}
          onPrev={handleTimetablePrev}
          onNext={handleTimetableNext}
        />
      </CalendarSurface>

      {/* 선택된 공고 정보 */}
      {selectedJobPostId !== null && (
        <>
          <S.SectionLabel>공고 정보</S.SectionLabel>
          <SelectedJobPostSection postId={selectedJobPostId} />
        </>
      )}

      {/* 지원 이력 */}
      <S.SectionHeader>
        <S.SectionLabel>내 지원 현황</S.SectionLabel>
        <ApplicationsRefreshButton />
      </S.SectionHeader>
      <ApplicationListByStatus />
    </S.PageWrapper>
  );
};

const S = {
  PageWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  SectionHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  `,
  SectionLabel: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
};

export default WorkerDashBoardPage;
