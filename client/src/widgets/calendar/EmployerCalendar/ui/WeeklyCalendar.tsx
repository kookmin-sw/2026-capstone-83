import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styled from 'styled-components';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Schedule } from 'entities/schedule/model/types/schedule.type';
import { WeeklyScheduleCard } from 'entities/schedule/ui/WeeklyScheduleCard';
import { ViewToggle } from './ViewToggle';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

type ViewMode = 'monthly' | 'weekly';

interface Props {
  schedules: Record<string, Schedule[]>;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
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

// Sortable 아이템 래퍼
const SortableItem = ({ schedule }: { schedule: Schedule }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: schedule.jobPostId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <WeeklyScheduleCard schedule={schedule} />
    </div>
  );
};

export const WeeklyCalendar = ({ schedules, currentDate, onPrev, onNext, viewMode, onViewChange }: Props) => {
  const weekDays = getWeekDays(currentDate);
  const weekNum = getWeekNumber(currentDate);

  // 로컬 순서 상태 (드래그로 변경 가능)
  const [localOrder, setLocalOrder] = useState<Record<string, number[]>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const getOrderedSchedules = (dateStr: string): Schedule[] => {
    const daySchedules = schedules[dateStr] || [];
    const order = localOrder[dateStr];
    if (!order) return daySchedules;
    return order
      .map((id) => daySchedules.find((s) => s.jobPostId === id))
      .filter(Boolean) as Schedule[];
  };

  const handleDragEnd = (dateStr: string) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const daySchedules = getOrderedSchedules(dateStr);
    const oldIndex = daySchedules.findIndex((s) => s.jobPostId === active.id);
    const newIndex = daySchedules.findIndex((s) => s.jobPostId === over.id);

    const newOrder = arrayMove(daySchedules, oldIndex, newIndex).map((s) => s.jobPostId);
    setLocalOrder((prev) => ({ ...prev, [dateStr]: newOrder }));
  };

  return (
    <>
      <S.Header>
        <S.NavRow>
          <S.NavButton onClick={onPrev}><ChevronLeft size={20} /></S.NavButton>
          <S.MonthTitle>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {weekNum}주차
          </S.MonthTitle>
          <S.NavButton onClick={onNext}><ChevronRight size={20} /></S.NavButton>
        </S.NavRow>
        <ViewToggle viewMode={viewMode} onViewChange={onViewChange} />
      </S.Header>

      <S.WeekGrid>
        {weekDays.map((day, idx) => {
          const dateStr = formatDateStr(day);
          const orderedSchedules = getOrderedSchedules(dateStr);
          const isSaturday = idx === 5;
          const isSunday = idx === 6;

          return (
            <S.DayColumn key={dateStr}>
              <S.DayHeader $isSaturday={isSaturday} $isSunday={isSunday}>
                <span className="label">{DAYS_KR[idx]}</span>
                <span className="date">{day.getDate()}</span>
              </S.DayHeader>

              <S.DayContent>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd(dateStr)}
                >
                  <SortableContext
                    items={orderedSchedules.map((s) => s.jobPostId)}
                    strategy={verticalListSortingStrategy}
                  >
                    {orderedSchedules.map((s) => (
                      <SortableItem key={s.jobPostId} schedule={s} />
                    ))}
                  </SortableContext>
                </DndContext>

                <S.AddButton onClick={() => window.open(`/jobpost/create?workDate=${dateStr}`, '_blank')}>
                  <span>+ 공고 추가</span>
                </S.AddButton>
              </S.DayContent>
            </S.DayColumn>
          );
        })}
      </S.WeekGrid>
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
  WeekGrid: styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  `,
  DayColumn: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  DayHeader: styled.div<{ $isSaturday: boolean; $isSunday: boolean }>`
    text-align: center;
    padding: 8px 0;
    background-color: ${({ theme }) => theme.color.background};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    .label {
      display: block;
      font-size: ${({ theme }) => theme.fontSize.xsmall};
      color: ${({ theme, $isSaturday, $isSunday }) =>
      $isSunday ? theme.color.error : $isSaturday ? theme.color.primary : theme.color.subText};
    }
    .date {
      display: block;
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
      color: ${({ theme, $isSaturday, $isSunday }) =>
      $isSunday ? theme.color.error : $isSaturday ? theme.color.primary : theme.color.text};
    }
  `,
  DayContent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 200px;
  `,
  AddButton: styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 16px 8px;
    border: 2px dashed ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: transparent;
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    z-index: 2;

    ${hoverOverlay}

    &:hover {
      border-color: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.primary};
    }
  `,
};
