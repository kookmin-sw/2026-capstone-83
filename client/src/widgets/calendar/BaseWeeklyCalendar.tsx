import { type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Schedule } from 'entities/schedule/model/types/schedule.type';
import { ViewToggle } from './EmployerCalendar/ui/ViewToggle';
import * as CS from './styles/calendar.styled';

type ViewMode = 'monthly' | 'weekly';

interface Props {
  schedules: Record<string, Schedule[]>;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  renderCard: (schedule: Schedule, dateStr: string) => ReactNode;
  renderFooter?: (dateStr: string) => ReactNode;
}

const DAYS_KR = ['월', '화', '수', '목', '금', '토', '일'];

const getWeekDays = (date: Date) => {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day === 0 ? 7 : day) - 1));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const getWeekNumber = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
};

const formatDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const BaseWeeklyCalendar = ({
  schedules,
  currentDate,
  onPrev,
  onNext,
  viewMode,
  onViewChange,
  renderCard,
  renderFooter,
}: Props) => {
  const weekDays = getWeekDays(currentDate);
  const weekNum = getWeekNumber(currentDate);
  const now = new Date();
  const todayStr = formatDateStr(now);

  return (
    <>
      <CS.CalendarHeader>
        <CS.NavRow>
          <CS.NavButton onClick={onPrev}><ChevronLeft size={20} /></CS.NavButton>
          <CS.CalendarTitle>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {weekNum}주차
          </CS.CalendarTitle>
          <CS.NavButton onClick={onNext}><ChevronRight size={20} /></CS.NavButton>
        </CS.NavRow>
        <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />
      </CS.CalendarHeader>

      <CS.WeekGrid>
        {weekDays.map((day, idx) => {
          const dateStr = formatDateStr(day);
          const daySchedules = schedules[dateStr] || [];
          const isSaturday = idx === 5;
          const isSunday = idx === 6;
          const isToday = dateStr === todayStr;

          return (
            <CS.DayColumn key={dateStr}>
              <CS.DayHeader $isSaturday={isSaturday} $isSunday={isSunday} $isToday={isToday}>
                <span className="label">{DAYS_KR[idx]}</span>
                <span className="date">{day.getDate()}</span>
              </CS.DayHeader>

              <CS.DayContent>
                {daySchedules.map((s) => renderCard(s, dateStr))}
                {renderFooter && renderFooter(dateStr)}
              </CS.DayContent>
            </CS.DayColumn>
          );
        })}
      </CS.WeekGrid>
    </>
  );
};
