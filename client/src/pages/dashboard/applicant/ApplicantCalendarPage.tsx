import { useState } from 'react';
import styled from 'styled-components';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import type { ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import { ApplicantCalendarWidget } from 'widgets/calendar/ApplicantCalendar/ui/ApplicantCalendarWidget';
import { HiredWeeklyTimetable } from 'widgets/calendar/ApplicantCalendar/ui/HiredWeeklyTimetable';

const ApplicantCalendarPage = () => {
  const schedules = useScheduleStore((s) => s.schedules);
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
      <ApplicantCalendarWidget />

      <S.TimetableWrapper>
        <HiredWeeklyTimetable
          schedules={schedules as Record<string, ApplicantSchedule[]>}
          currentDate={timetableDate}
          onPrev={handleTimetablePrev}
          onNext={handleTimetableNext}
        />
      </S.TimetableWrapper>
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
};

export default ApplicantCalendarPage;
