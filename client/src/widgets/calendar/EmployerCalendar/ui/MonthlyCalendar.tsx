import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styled from 'styled-components';
import type { Schedule } from 'entities/schedule/model/types/schedule.type';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { ScheduleChip } from 'entities/schedule/ui/ScheduleChip';
import Modal from 'shared/ui/Modal/Modal';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

import { ViewToggle } from './ViewToggle';

type ViewMode = 'monthly' | 'weekly';

interface Props {
  schedules: Record<string, Schedule[]>;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  onNavigate: (date: Date) => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const getCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const days: { date: number; month: 'prev' | 'current' | 'next'; fullDate: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevLastDate - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    days.push({ date: d, month: 'prev', fullDate: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` });
  }

  for (let i = 1; i <= lastDate; i++) {
    days.push({ date: i, month: 'current', fullDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const m = month + 2 > 12 ? 1 : month + 2;
    const y = month + 2 > 12 ? year + 1 : year;
    days.push({ date: i, month: 'next', fullDate: `${y}-${String(m).padStart(2, '0')}-${String(i).padStart(2, '0')}` });
  }

  return days;
};

export const MonthlyCalendar = ({ schedules, currentDate, onPrev, onNext, onNavigate, viewMode, onViewChange }: Props) => {
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const selectedJobPostId = useScheduleStore((s) => s.selectedJobPostId);
  const days = getCalendarDays(currentDate);
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const detailSchedules = detailDate ? (schedules[detailDate] || []) : [];

  const handleCellClick = (fullDate: string, monthType: 'prev' | 'current' | 'next') => {
    // 다른 달 셀 클릭 시 해당 달로 이동
    if (monthType !== 'current') {
      const [year, month] = fullDate.split('-').map(Number);
      onNavigate(new Date(year, month - 1, 1));
      return;
    }

    const daySchedules = schedules[fullDate] || [];
    if (daySchedules.length > 0) {
      setDetailDate(fullDate);
    }
  };

  // 해당 날짜에서 표시할 공고 결정: 선택된 공고가 그 날짜에 있으면 그걸, 아니면 첫 번째
  const getDisplaySchedule = (daySchedules: Schedule[]) => {
    if (daySchedules.length === 0) return null;
    const selected = daySchedules.find((s) => s.jobPostId === selectedJobPostId);
    return selected || daySchedules[0];
  };

  return (
    <>
      <S.Header>
        <S.NavRow>
          <S.NavButton onClick={onPrev}><ChevronLeft size={20} /></S.NavButton>
          <S.MonthTitle>{currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월</S.MonthTitle>
          <S.NavButton onClick={onNext}><ChevronRight size={20} /></S.NavButton>
          {/* <S.Legend>
            <S.LegendDot $color="highlight" /> 모집중
            <S.LegendDot $color="subText" /> 모집완료
          </S.Legend> */}
        </S.NavRow>
        <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />
      </S.Header>

      <S.Grid>
        {DAYS.map((day, i) => (
          <S.DayHeader key={day} $isSunday={i === 0} $isSaturday={i === 6}>
            {day}
          </S.DayHeader>
        ))}

        {days.map(({ date, month, fullDate }, idx) => {
          const daySchedules = schedules[fullDate] || [];
          const isToday = fullDate === today;
          const isSunday = idx % 7 === 0;
          const isSaturday = idx % 7 === 6;

          return (
            <S.Cell
              key={fullDate + idx}
              $isOtherMonth={month !== 'current'}
              onClick={() => handleCellClick(fullDate, month)}
            >
              <S.CellHeader>
                <S.DateNumber $isToday={isToday} $isSunday={isSunday} $isSaturday={isSaturday}>
                  {date}
                </S.DateNumber>
                {daySchedules.length > 1 && (
                  <S.ExtraCount>+{daySchedules.length - 1}</S.ExtraCount>
                )}
              </S.CellHeader>

              {daySchedules.length > 0 ? (
                <S.ChipArea>
                  <ScheduleChip
                    schedule={getDisplaySchedule(daySchedules)!}
                    onSelect={month !== 'current' ? () => {
                      const [y, m] = fullDate.split('-').map(Number);
                      onNavigate(new Date(y, m - 1, 1));
                    } : undefined}
                  />
                </S.ChipArea>
              ) : (
                month === 'current' && (
                  <S.EmptyCellAdd onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/jobpost/create?workDate=${fullDate}`, '_blank');
                  }}>
                    + 공고 추가
                  </S.EmptyCellAdd>
                )
              )}
            </S.Cell>
          );
        })}
      </S.Grid>

      {/* 공고 목록 모달 */}
      <Modal isOpen={!!detailDate} onClose={() => setDetailDate(null)}>
        <S.ModalContent>
          <S.ModalHeader>
            <h3>공고 선택</h3>
            <S.ModalDate>{detailDate}</S.ModalDate>
          </S.ModalHeader>

          {detailSchedules.map((s) => (
            <ScheduleChip key={s.jobPostId} schedule={s} />
          ))}

          <S.AddJobPostButton onClick={() => {
            setDetailDate(null);
            window.open(`/jobpost/create?workDate=${detailDate}`, '_blank');
          }}>
            + 공고 추가
          </S.AddJobPostButton>
        </S.ModalContent>
      </Modal>
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
  Legend: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  LegendDot: styled.span<{ $color: string }>`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme, $color }) =>
      $color === 'highlight' ? theme.color.highlight : theme.color.error};
    margin-left: 8px;
  `,
  Grid: styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    border: 1px solid color-mix(in srgb, ${({ theme }) => theme.color.border}, transparent 40%);
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
  `,
  DayHeader: styled.div<{ $isSunday: boolean; $isSaturday: boolean }>`
    padding: 10px 0;
    text-align: center;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    background-color: ${({ theme }) => theme.color.secondary};
    color: ${({ theme, $isSunday, $isSaturday }) =>
      $isSunday ? theme.color.error : $isSaturday ? theme.color.primary : theme.color.text};
  `,
  Cell: styled.div<{ $isOtherMonth: boolean }>`
    min-height: 100px;
    padding: 12px 8px;
    border: 0.5px solid color-mix(in srgb, ${({ theme }) => theme.color.border}, transparent 80%);
    opacity: ${({ $isOtherMonth }) => ($isOtherMonth ? 0.4 : 1)};
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.15s ease;

    &:hover {
      transform: scale(1.03);
      z-index: 1;
    }

    ${hoverOverlay}

    /* 칩이나 추가 버튼 위에 커서가 있으면 셀 오버레이 해제 */
    &:has(> div > div:hover)::after,
    &:has(> button:hover)::after {
      opacity: 0 !important;
    }
  `,
  CellHeader: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  DateNumber: styled.div<{ $isToday: boolean; $isSunday: boolean; $isSaturday: boolean }>`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ $isToday, theme }) => $isToday ? theme.fontWeight.semibold : theme.fontWeight.medium};
    color: ${({ theme, $isToday, $isSunday, $isSaturday }) =>
      $isToday ? theme.color.white
        : $isSunday ? theme.color.error
          : $isSaturday ? theme.color.primary
            : theme.color.text};
    ${({ $isToday, theme }) => $isToday && `
      background-color: ${theme.color.tertiary};
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    `}
  `,
  TodayLabel: styled.span`
    font-size: 9px;
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  ExtraCount: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.thirdText};
    position: relative;
    z-index: 2;
    margin-right: 8px;
  `,
  ChipArea: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  `,
  ModalContent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  ModalHeader: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;

    h3 {
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
    }
  `,
  ModalDate: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
  AddJobPostButton: styled.button`
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
  `,
  EmptyCellAdd: styled.button`
    display: none;
    align-items: center;
    justify-content: center;
    flex: 1;
    border: 2px dashed ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
    cursor: pointer;
    transition: all 0.15s ease;
    padding: 4px 2px;
    position: relative;
    z-index: 2;

    /* 부모 Cell 호버 시 표시 */
    div:hover > & {
      display: flex;
    }

    &:hover {
      border-color: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.primary};
    }
  `,
};
