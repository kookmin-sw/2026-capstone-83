import { useState } from 'react';
import styled from 'styled-components';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import type { ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import { ApplicantCalendarWidget } from 'widgets/calendar/ApplicantCalendar/ui/ApplicantCalendarWidget';
import { HiredWeeklyTimetable } from 'widgets/calendar/ApplicantCalendar/ui/HiredWeeklyTimetable';
import SelectedJobPostSection from 'entities/jobPost/ui/SelectedJobPostSection';

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
      <S.TimetableWrapper>
        <HiredWeeklyTimetable
          schedules={schedules as Record<string, ApplicantSchedule[]>}
          currentDate={timetableDate}
          onPrev={handleTimetablePrev}
          onNext={handleTimetableNext}
        />
      </S.TimetableWrapper>

      {/* 선택된 공고 정보 */}
      {selectedJobPostId !== null && (
        <>
          <S.SectionLabel>공고 정보</S.SectionLabel>
          <SelectedJobPostSection postId={selectedJobPostId} />
        </>
      )}
    </S.PageWrapper>
  );
};

const S = {
  PageWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  TimetableWrapper: styled.div`
    padding: 32px;
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
  `,
  SectionLabel: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
};

export default WorkerDashBoardPage;
