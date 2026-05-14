import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import styled from 'styled-components';
import type { ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  schedules: Record<string, ApplicantSchedule[]>;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
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

const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const formatHour = (hour: number) => {
  const period = hour < 12 ? 'AM' : 'PM';
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(h).padStart(2, '0')} ${period}`;
};

export const HiredWeeklyTimetable = ({ schedules, currentDate, onPrev, onNext }: Props) => {
  const weekDays = getWeekDays(currentDate);
  const weekNum = getWeekNumber(currentDate);
  const selectedId = useScheduleStore((s) => s.selectedJobPostId);
  const setSelectedId = useScheduleStore((s) => s.setSelectedJobPostId);

  // 채용 확정된 스케줄만 필터링
  const hiredSchedules: Record<string, ApplicantSchedule[]> = {};
  weekDays.forEach((day) => {
    const dateStr = formatDateStr(day);
    const daySchedules = (schedules[dateStr] || []) as ApplicantSchedule[];
    const hired = daySchedules.filter((s) => s.applyStatus === 'HIRED');
    if (hired.length > 0) hiredSchedules[dateStr] = hired;
  });

  // 시간 범위 계산
  const allHired = Object.values(hiredSchedules).flat();
  let minHour = 24;
  let maxHour = 0;
  allHired.forEach((s) => {
    const startH = Math.floor(timeToMinutes(s.workStart) / 60);
    const endH = Math.ceil(timeToMinutes(s.workEnd) / 60);
    if (startH < minHour) minHour = startH;
    if (endH > maxHour) maxHour = endH;
  });

  if (allHired.length === 0) { minHour = 9; maxHour = 18; }
  minHour = Math.max(0, minHour - 1);
  maxHour = Math.min(24, maxHour + 1);
  if (maxHour - minHour < 6) maxHour = minHour + 6;

  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i);
  const HOUR_HEIGHT = 60;

  const now = new Date();
  const todayStr = formatDateStr(now);

  return (
    <>
      <S.Header>
        <S.NavRow>
          <S.NavButton onClick={onPrev}><ChevronLeft size={20} /></S.NavButton>
          <S.MonthTitle>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {weekNum}주차 — 근무 일정
          </S.MonthTitle>
          <S.NavButton onClick={onNext}><ChevronRight size={20} /></S.NavButton>
        </S.NavRow>
      </S.Header>

      {allHired.length === 0 ? (
        <S.EmptyMessage>이번 주 확정된 근무 일정이 없습니다.</S.EmptyMessage>
      ) : (
        <S.GridWrapper>
          <S.TimeColumn>
            <S.DayHeaderPlaceholder />
            {hours.map((h) => (
              <S.TimeLabel key={h} $height={HOUR_HEIGHT}>
                {formatHour(h)}
              </S.TimeLabel>
            ))}
          </S.TimeColumn>

          {weekDays.map((day, idx) => {
            const dateStr = formatDateStr(day);
            const dayHired = hiredSchedules[dateStr] || [];
            const isSaturday = idx === 5;
            const isSunday = idx === 6;
            const isToday = dateStr === todayStr;

            return (
              <S.DayColumn key={dateStr}>
                <S.DayHeader $isSaturday={isSaturday} $isSunday={isSunday} $isToday={isToday}>
                  <span className="label">{DAYS_KR[idx]}</span>
                  <span className="date">{day.getDate()}</span>
                </S.DayHeader>

                <S.TimeGrid $height={hours.length * HOUR_HEIGHT}>
                  {hours.map((_, i) => (
                    <S.HourLine key={i} style={{ top: `${i * HOUR_HEIGHT}px` }} />
                  ))}

                  {dayHired.map((s) => {
                    const startMin = timeToMinutes(s.workStart) - minHour * 60;
                    const endMin = timeToMinutes(s.workEnd) - minHour * 60;
                    const top = (startMin / 60) * HOUR_HEIGHT;
                    const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;
                    const isSelected = selectedId === s.jobPostId;

                    return (
                      <S.ScheduleBar
                        key={s.jobPostId}
                        data-bar
                        $selected={isSelected}
                        style={{ top: `${top}px`, height: `${Math.max(height, 40)}px` }}
                        onClick={() => setSelectedId(isSelected ? null : s.jobPostId)}
                      >
                        <S.BarTitle>{s.title}</S.BarTitle>
                        <S.BarMeta><Clock size={10} /> {s.workStart} - {s.workEnd}</S.BarMeta>
                        {s.location && <S.BarMeta><MapPin size={10} /> {s.location}</S.BarMeta>}
                      </S.ScheduleBar>
                    );
                  })}
                </S.TimeGrid>
              </S.DayColumn>
            );
          })}
        </S.GridWrapper>
      )}
    </>
  );
};

const S = {
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  `,
  NavRow: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
  `,
  MonthTitle: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
  `,
  NavButton: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    cursor: pointer;
    color: ${({ theme }) => theme.color.text};
    padding: 4px;
    border-radius: 50%;
    &:hover { background-color: ${({ theme }) => theme.color.background}; }
  `,
  EmptyMessage: styled.p`
    text-align: center;
    padding: 60px 20px;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
  `,
  GridWrapper: styled.div`
    display: flex;
    gap: 0;
    overflow-x: auto;
  `,
  TimeColumn: styled.div`
    flex-shrink: 0;
    width: 60px;
  `,
  DayHeaderPlaceholder: styled.div`
    height: 56px;
  `,
  TimeLabel: styled.div<{ $height: number }>`
    height: ${({ $height }) => $height}px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding-right: 8px;
    font-size: 10px;
    color: ${({ theme }) => theme.color.subText};
    transform: translateY(-6px);
  `,
  DayColumn: styled.div`
    flex: 1;
    min-width: 120px;
    border-left: 1px solid color-mix(in srgb, ${({ theme }) => theme.color.border}, transparent 40%);
    overflow: hidden;

    ${hoverOverlay}

    /* 스케줄 바 호버 시 칼럼 오버레이 해제 */
    &:has([data-bar]:hover)::after {
      opacity: 0 !important;
    }
  `,
  DayHeader: styled.div<{ $isSaturday: boolean; $isSunday: boolean; $isToday: boolean }>`
    text-align: center;
    padding: 8px 0;
    height: 56px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background-color: ${({ theme }) => theme.color.secondary};
    .label {
      display: block;
      font-size: ${({ theme }) => theme.fontSize.xsmall};
      font-weight: ${({ theme, $isToday }) => $isToday ? theme.fontWeight.semibold : theme.fontWeight.regular};
      color: ${({ theme, $isSaturday, $isSunday, $isToday }) =>
      $isToday ? theme.color.primary
        : $isSunday ? theme.color.error
          : $isSaturday ? theme.color.primary
            : theme.color.subText};
    }
    .date {
      display: block;
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
      color: ${({ theme, $isSaturday, $isSunday, $isToday }) =>
      $isToday ? theme.color.primary
        : $isSunday ? theme.color.error
          : $isSaturday ? theme.color.primary
            : theme.color.text};
    }
  `,
  TimeGrid: styled.div<{ $height: number }>`
    position: relative;
    height: ${({ $height }) => $height}px;
  `,
  HourLine: styled.div`
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.color.border};
    opacity: 0.5;
  `,
  ScheduleBar: styled.div<{ $selected: boolean }>`
    position: absolute;
    left: 4px;
    width: calc(100% - 8px);
    padding: 10px;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.color.secondary : theme.color.background};
    border: ${({ theme, $selected }) =>
      $selected ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`};
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.15s ease;
    z-index: 2;

    ${hoverOverlay}
  `,
  BarTitle: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  BarMeta: styled.span`
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: ${({ theme }) => theme.color.subText};
  `,
};
