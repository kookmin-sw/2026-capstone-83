import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import styled from 'styled-components';
import type { ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { calendarHeaderCss } from 'widgets/calendar/styles/calendar.styled';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  schedules: Record<string, ApplicantSchedule[]>;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
}

const DAYS_KR = ['월', '화', '수', '목', '금', '토', '일'];

const DESKTOP_HOUR_HEIGHT = 60;
const TABLET_HOUR_HEIGHT = 48;

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

  const hiredSchedules: Record<string, ApplicantSchedule[]> = {};
  weekDays.forEach((day) => {
    const dateStr = formatDateStr(day);
    const daySchedules = (schedules[dateStr] || []) as ApplicantSchedule[];
    const hired = daySchedules.filter((s) => s.applyStatus === 'HIRED');
    if (hired.length > 0) hiredSchedules[dateStr] = hired;
  });

  const allHired = Object.values(hiredSchedules).flat();
  let minHour = 24;
  let maxHour = 0;
  allHired.forEach((s) => {
    const startH = Math.floor(timeToMinutes(s.workStart) / 60);
    const endH = Math.ceil(timeToMinutes(s.workEnd) / 60);
    if (startH < minHour) minHour = startH;
    if (endH > maxHour) maxHour = endH;
  });

  if (allHired.length === 0) {
    minHour = 9;
    maxHour = 18;
  }
  minHour = Math.max(0, minHour - 1);
  maxHour = Math.min(24, maxHour + 1);
  if (maxHour - minHour < 6) maxHour = minHour + 6;

  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i);

  const now = new Date();
  const todayStr = formatDateStr(now);

  const toggleSelect = (jobPostId: number) => {
    setSelectedId(selectedId === jobPostId ? null : jobPostId);
  };

  return (
    <>
      <S.Header>
        <S.NavRow>
          <S.NavButton type="button" onClick={onPrev} aria-label="이전 주">
            <ChevronLeft size={20} />
          </S.NavButton>
          <S.MonthTitle>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {weekNum}주차 — 근무 일정
          </S.MonthTitle>
          <S.NavButton type="button" onClick={onNext} aria-label="다음 주">
            <ChevronRight size={20} />
          </S.NavButton>
        </S.NavRow>
      </S.Header>

      {allHired.length === 0 ? (
        <S.EmptyMessage>이번 주 확정된 근무 일정이 없습니다.</S.EmptyMessage>
      ) : (
        <>
          {/* 모바일: 날짜별 리스트 */}
          <S.ListView>
            {weekDays.map((day, idx) => {
              const dateStr = formatDateStr(day);
              const dayHired = hiredSchedules[dateStr] || [];
              if (dayHired.length === 0) return null;

              const isSaturday = idx === 5;
              const isSunday = idx === 6;
              const isToday = dateStr === todayStr;

              return (
                <S.ListDayGroup key={dateStr}>
                  <S.ListDayHeader
                    $isSaturday={isSaturday}
                    $isSunday={isSunday}
                    $isToday={isToday}
                  >
                    <span className="label">{DAYS_KR[idx]}</span>
                    <span className="date">{day.getDate()}일</span>
                  </S.ListDayHeader>
                  {dayHired.map((s) => {
                    const isSelected = selectedId === s.jobPostId;
                    return (
                      <S.ListCard
                        key={s.jobPostId}
                        type="button"
                        $selected={isSelected}
                        onClick={() => toggleSelect(s.jobPostId)}
                      >
                        <S.ListCardTitle>{s.title}</S.ListCardTitle>
                        <S.ListCardMeta>
                          <Clock size={14} />
                          {s.workStart} - {s.workEnd}
                        </S.ListCardMeta>
                        {s.location && (
                          <S.ListCardMeta>
                            <MapPin size={14} />
                            {s.location}
                          </S.ListCardMeta>
                        )}
                      </S.ListCard>
                    );
                  })}
                </S.ListDayGroup>
              );
            })}
          </S.ListView>

          {/* 태블릿 이상: 타임그리드 */}
          <S.GridWrapper>
            <S.TimeColumn>
              <S.DayHeaderPlaceholder />
              {hours.map((h) => (
                <S.TimeLabel key={h} $desktopHeight={DESKTOP_HOUR_HEIGHT} $tabletHeight={TABLET_HOUR_HEIGHT}>
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
              const gridHeightDesktop = hours.length * DESKTOP_HOUR_HEIGHT;
              const gridHeightTablet = hours.length * TABLET_HOUR_HEIGHT;

              return (
                <S.DayColumn key={dateStr}>
                  <S.DayHeader $isSaturday={isSaturday} $isSunday={isSunday} $isToday={isToday}>
                    <span className="label">{DAYS_KR[idx]}</span>
                    <span className="date">{day.getDate()}</span>
                  </S.DayHeader>

                  <S.TimeGrid
                    $heightDesktop={gridHeightDesktop}
                    $heightTablet={gridHeightTablet}
                  >
                    {hours.map((_, i) => (
                      <S.HourLine
                        key={i}
                        $index={i}
                        $desktopHeight={DESKTOP_HOUR_HEIGHT}
                        $tabletHeight={TABLET_HOUR_HEIGHT}
                      />
                    ))}

                    {dayHired.map((s) => {
                      const startMin = timeToMinutes(s.workStart) - minHour * 60;
                      const endMin = timeToMinutes(s.workEnd) - minHour * 60;
                      const isSelected = selectedId === s.jobPostId;

                      return (
                        <S.ScheduleBar
                          key={s.jobPostId}
                          data-bar
                          $selected={isSelected}
                          $topDesktop={(startMin / 60) * DESKTOP_HOUR_HEIGHT}
                          $heightDesktop={Math.max(
                            ((endMin - startMin) / 60) * DESKTOP_HOUR_HEIGHT,
                            40
                          )}
                          $topTablet={(startMin / 60) * TABLET_HOUR_HEIGHT}
                          $heightTablet={Math.max(
                            ((endMin - startMin) / 60) * TABLET_HOUR_HEIGHT,
                            36
                          )}
                          onClick={() => toggleSelect(s.jobPostId)}
                        >
                          <S.BarTitle>{s.title}</S.BarTitle>
                          <S.BarMeta>
                            <Clock size={10} /> {s.workStart} - {s.workEnd}
                          </S.BarMeta>
                          {s.location && (
                            <S.BarMeta className="location">
                              <MapPin size={10} /> {s.location}
                            </S.BarMeta>
                          )}
                        </S.ScheduleBar>
                      );
                    })}
                  </S.TimeGrid>
                </S.DayColumn>
              );
            })}
          </S.GridWrapper>
        </>
      )}
    </>
  );
};

const S = {
  Header: styled.header`
    ${calendarHeaderCss}
    margin-bottom: 16px;
  `,
  NavRow: styled.div`
    display: flex;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;
  `,
  MonthTitle: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    line-height: 1.35;
    flex: 1;
    min-width: 0;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      font-size: ${({ theme }) => theme.fontSize.medium};
    }

    @media (${({ theme }) => theme.mediaQuery.mobile}) {
      font-size: ${({ theme }) => theme.fontSize.small};
    }
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
    flex-shrink: 0;
    &:hover { background-color: ${({ theme }) => theme.color.background}; }
  `,
  EmptyMessage: styled.p`
    text-align: center;
    padding: 60px 20px;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
  `,
  ListView: styled.div`
    display: none;
    flex-direction: column;
    gap: 20px;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      display: flex;
    }
  `,
  ListDayGroup: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  ListDayHeader: styled.div<{ $isSaturday: boolean; $isSunday: boolean; $isToday: boolean }>`
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};

    .label {
      font-size: ${({ theme }) => theme.fontSize.small};
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
      color: ${({ theme, $isSaturday, $isSunday, $isToday }) =>
        $isToday
          ? theme.color.primary
          : $isSunday
            ? theme.color.error
            : $isSaturday
              ? theme.color.primary
              : theme.color.text};
    }

    .date {
      font-size: ${({ theme }) => theme.fontSize.xsmall};
      color: ${({ theme }) => theme.color.subText};
    }
  `,
  ListCard: styled.button<{ $selected: boolean }>`
    width: 100%;
    text-align: left;
    padding: 12px 14px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.color.secondary : theme.color.background};
    border: ${({ theme, $selected }) =>
      $selected ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`};
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    transition: all 0.15s ease;

    ${hoverOverlay}
  `,
  ListCardTitle: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  ListCardMeta: styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  GridWrapper: styled.div`
    display: flex;
    gap: 0;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    min-width: 0;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      display: none;
    }
  `,
  TimeColumn: styled.div`
    flex-shrink: 0;
    width: 60px;
    position: sticky;
    left: 0;
    z-index: 3;
    background-color: ${({ theme }) => theme.color.white};

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      width: 52px;
    }
  `,
  DayHeaderPlaceholder: styled.div`
    height: 56px;

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      height: 48px;
    }
  `,
  TimeLabel: styled.div<{ $desktopHeight: number; $tabletHeight: number }>`
    height: ${({ $desktopHeight }) => $desktopHeight}px;
    display: flex;
    align-items: flex-start;
    justify-content: flex-end;
    padding-right: 8px;
    font-size: 10px;
    color: ${({ theme }) => theme.color.subText};
    transform: translateY(-6px);

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      height: ${({ $tabletHeight }) => $tabletHeight}px;
      padding-right: 4px;
      font-size: 9px;
    }
  `,
  DayColumn: styled.div`
    flex: 1;
    min-width: 120px;
    border-left: 1px solid color-mix(in srgb, ${({ theme }) => theme.color.border}, transparent 40%);
    overflow: hidden;
    scroll-snap-align: start;

    ${hoverOverlay}

    &:has([data-bar]:hover)::after {
      opacity: 0 !important;
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      min-width: 100px;
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
      font-weight: ${({ theme, $isToday }) =>
        $isToday ? theme.fontWeight.semibold : theme.fontWeight.regular};
      color: ${({ theme, $isSaturday, $isSunday, $isToday }) =>
        $isToday
          ? theme.color.primary
          : $isSunday
            ? theme.color.error
            : $isSaturday
              ? theme.color.primary
              : theme.color.subText};
    }

    .date {
      display: block;
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
      color: ${({ theme, $isSaturday, $isSunday, $isToday }) =>
        $isToday
          ? theme.color.primary
          : $isSunday
            ? theme.color.error
            : $isSaturday
              ? theme.color.primary
              : theme.color.text};
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      height: 48px;
      padding: 6px 0;

      .date {
        font-size: ${({ theme }) => theme.fontSize.medium};
      }
    }
  `,
  TimeGrid: styled.div<{ $heightDesktop: number; $heightTablet: number }>`
    position: relative;
    height: ${({ $heightDesktop }) => $heightDesktop}px;

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      height: ${({ $heightTablet }) => $heightTablet}px;
    }
  `,
  HourLine: styled.div<{
    $index: number;
    $desktopHeight: number;
    $tabletHeight: number;
  }>`
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.color.border};
    opacity: 0.5;
    top: ${({ $index, $desktopHeight }) => $index * $desktopHeight}px;

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      top: ${({ $index, $tabletHeight }) => $index * $tabletHeight}px;
    }
  `,
  ScheduleBar: styled.div<{
    $selected: boolean;
    $topDesktop: number;
    $heightDesktop: number;
    $topTablet: number;
    $heightTablet: number;
  }>`
    position: absolute;
    left: 4px;
    width: calc(100% - 8px);
    top: ${({ $topDesktop }) => $topDesktop}px;
    height: ${({ $heightDesktop }) => $heightDesktop}px;
    padding: 8px;
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

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      top: ${({ $topTablet }) => $topTablet}px;
      height: ${({ $heightTablet }) => $heightTablet}px;
      padding: 6px;

      .location {
        display: none;
      }
    }
  `,
  BarTitle: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  BarMeta: styled.span`
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    color: ${({ theme }) => theme.color.subText};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
};
