import { useState } from 'react';
import { openJobPostCreatePage } from 'entities/profileSetup/lib/jobPostCreateNavigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
import * as CS from 'widgets/calendar/styles/calendar.styled';

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
          const orderedSchedules = getOrderedSchedules(dateStr);
          const isSaturday = idx === 5;
          const isSunday = idx === 6;

          return (
            <CS.DayColumn key={dateStr}>
              <CS.DayHeader $isSaturday={isSaturday} $isSunday={isSunday}>
                <span className="label">{DAYS_KR[idx]}</span>
                <span className="date">{day.getDate()}</span>
              </CS.DayHeader>

              <CS.DayContent>
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

                <CS.AddButton onClick={() => {
                  void openJobPostCreatePage({ workDate: dateStr });
                }}>
                  <span>+ 공고 추가</span>
                </CS.AddButton>
              </CS.DayContent>
            </CS.DayColumn>
          );
        })}
      </CS.WeekGrid>
    </>
  );
};

