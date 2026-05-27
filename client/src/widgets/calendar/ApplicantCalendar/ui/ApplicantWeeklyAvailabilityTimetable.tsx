import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, ChevronDown, ChevronLeft, ChevronRight, Clock, MapPin, Trash2 } from 'lucide-react';
import styled, { css } from 'styled-components';
import type { ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import {
  useCreateWorkerAvailability,
  useDeleteWorkerAvailability,
  useUpdateWorkerAvailability,
  useWorkerAvailabilityRange,
} from 'entities/workerAvailability/model/hooks/useWorkerAvailability';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { calendarHeaderCss } from 'widgets/calendar/styles/calendar.styled';
import { hoverOverlay } from 'shared/styles/hoverOverlay';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import {
  buildDateTimeRange,
  clampEditableMinuteForDay,
  computeHourBounds,
  daySegmentToSlotDateTimes,
  DESKTOP_HOUR_HEIGHT,
  formatDateStr,
  formatHour,
  getAvailabilitySegmentsForDay,
  getHiredSchedulesForWeek,
  getMinEditableMinuteForDay,
  getPastOverlayHeight,
  getWeekDays,
  getWeekNumber,
  isDayFullyPast,
  minutesToTime,
  overlapsAvailabilityOnDay,
  overlapsHiredOnDay,
  TABLET_HOUR_HEIGHT,
  timeToMinutes,
  toLocalDateTimeString,
  validateAvailabilityRange,
  yToMinutesInGrid,
  DAYS_KR,
} from '../lib/weeklyTimetableUtils';

interface Props {
  schedules: Record<string, ApplicantSchedule[]>;
  currentDate: Date;
  onPrev: () => void;
  onNext: () => void;
}

type DragState = {
  dateStr: string;
  startMinute: number;
  endMinute: number;
};

type DraftSlot = DragState & {
  minDurationMinutes: number;
};

type EditDraft = {
  slotId: number;
  dateStr: string;
  startMinute: number;
  endMinute: number;
  minDurationMinutes: number;
};

type ResizeState = {
  edge: 'top' | 'bottom';
  dateStr: string;
};

type ViewHourRange = {
  minHour: number;
  maxHour: number;
};

type ViewBoundsDragState = {
  edge: 'top' | 'bottom';
  startY: number;
  anchorMin: number;
  anchorMax: number;
};

export const ApplicantWeeklyAvailabilityTimetable = ({
  schedules,
  currentDate,
  onPrev,
  onNext,
}: Props) => {
  const weekDays = getWeekDays(currentDate);
  const weekFrom = formatDateStr(weekDays[0]);
  const weekTo = formatDateStr(weekDays[6]);

  const { data: availability = [], isLoading } = useWorkerAvailabilityRange({
    fromDate: weekFrom,
    toDate: weekTo,
  });
  const { mutate: createSlot, isPending: isCreating } = useCreateWorkerAvailability();
  const { mutate: updateSlot, isPending: isUpdating } = useUpdateWorkerAvailability();
  const { mutate: deleteSlot, isPending: isDeleting } = useDeleteWorkerAvailability();
  const errorModal = useErrorAlertModal();

  const selectedJobPostId = useScheduleStore((s) => s.selectedJobPostId);
  const setSelectedJobPostId = useScheduleStore((s) => s.setSelectedJobPostId);

  const [drag, setDrag] = useState<DragState | null>(null);
  const [draft, setDraft] = useState<DraftSlot | null>(null);
  const [editDraft, setEditDraft] = useState<EditDraft | null>(null);
  const [resize, setResize] = useState<ResizeState | null>(null);

  const [mobileAddDate, setMobileAddDate] = useState<string | null>(null);
  const [mobileStart, setMobileStart] = useState('09:00');
  const [mobileEnd, setMobileEnd] = useState('18:00');
  const [mobileMin, setMobileMin] = useState(0);
  const [isIntroExpanded, setIsIntroExpanded] = useState(false);
  const [customViewHours, setCustomViewHours] = useState<ViewHourRange | null>(null);

  const gridPointerRef = useRef<{ dateStr: string; day: Date } | null>(null);
  const resizePointerRef = useRef<ResizeState | null>(null);
  const viewBoundsDragRef = useRef<ViewBoundsDragState | null>(null);

  const hiredByDay = useMemo(
    () => getHiredSchedulesForWeek(schedules, weekDays),
    [schedules, weekDays],
  );

  const draftForBounds = draft ?? drag ?? (editDraft ? editDraft : null);
  const baseBounds = useMemo(
    () =>
      computeHourBounds(
        hiredByDay,
        availability,
        weekDays,
        draftForBounds
          ? {
              startMinute: Math.min(draftForBounds.startMinute, draftForBounds.endMinute),
              endMinute: Math.max(draftForBounds.startMinute, draftForBounds.endMinute),
            }
          : null,
      ),
    [hiredByDay, availability, weekDays, draftForBounds],
  );

  const { minHour, maxHour, hours } = useMemo(() => {
    if (!customViewHours) return baseBounds;

    const minHour = Math.min(baseBounds.minHour, customViewHours.minHour);
    const maxHour = Math.max(baseBounds.maxHour, customViewHours.maxHour);
    const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i);
    return { minHour, maxHour, hours };
  }, [baseBounds, customViewHours]);

  useEffect(() => {
    setCustomViewHours(null);
  }, [weekFrom, weekTo]);

  const gridHeightDesktop = hours.length * DESKTOP_HOUR_HEIGHT;
  const gridHeightTablet = hours.length * TABLET_HOUR_HEIGHT;

  const weekNum = getWeekNumber(currentDate);
  const now = new Date();
  const todayStr = formatDateStr(now);

  const selectedSlot = editDraft
    ? (availability.find((s) => s.id === editDraft.slotId) ?? null)
    : null;

  const selectAvailability = (
    slot: (typeof availability)[number],
    dateStr: string,
    startMinute: number,
    endMinute: number,
  ) => {
    setEditDraft({
      slotId: slot.id,
      dateStr,
      startMinute,
      endMinute,
      minDurationMinutes: slot.minDurationMinutes,
    });
    setDraft(null);
    setDrag(null);
    setResize(null);
    resizePointerRef.current = null;
  };

  const clearInteraction = () => {
    setDrag(null);
    setDraft(null);
    setEditDraft(null);
    setResize(null);
    resizePointerRef.current = null;
    setMobileAddDate(null);
  };

  const validateSlot = (dateStr: string, startMinute: number, endMinute: number, excludeId?: number) => {
    const day = weekDays.find((d) => formatDateStr(d) === dateStr);
    if (!day) return '날짜를 확인할 수 없습니다.';
    if (endMinute - startMinute < 15) return '가용시간은 최소 15분 이상이어야 합니다.';

    const { start } = buildDateTimeRange(dateStr, startMinute, endMinute);
    if (start.getTime() < Date.now()) return '과거 시간에는 가용시간을 등록할 수 없습니다.';

    if (overlapsHiredOnDay(dateStr, startMinute, endMinute, hiredByDay)) {
      return '채용 확정된 근무 시간과 겹칩니다.';
    }
    if (overlapsAvailabilityOnDay(day, startMinute, endMinute, availability, excludeId)) {
      return '이미 등록된 가용시간과 겹칩니다.';
    }
    return null;
  };

  const saveDraft = () => {
    if (!draft) return;
    const startMinute = Math.min(draft.startMinute, draft.endMinute);
    const endMinute = Math.max(draft.startMinute, draft.endMinute);
    const err = validateSlot(draft.dateStr, startMinute, endMinute);
    if (err) {
      errorModal.showError(new Error(err), err);
      return;
    }
    const { start, end } = buildDateTimeRange(draft.dateStr, startMinute, endMinute);
    createSlot(
      {
        startAt: toLocalDateTimeString(start),
        endAt: toLocalDateTimeString(end),
        minDurationMinutes: draft.minDurationMinutes || 0,
      },
      {
        onSuccess: () => clearInteraction(),
        onError: errorModal.onMutationError('가용시간 등록에 실패했습니다.'),
      },
    );
  };

  const saveSelectedEdit = () => {
    if (!selectedSlot || !editDraft) return;
    const { start, end } = daySegmentToSlotDateTimes(
      selectedSlot,
      editDraft.dateStr,
      editDraft.startMinute,
      editDraft.endMinute,
    );
    const err = validateAvailabilityRange(start, end, hiredByDay, availability, selectedSlot.id);
    if (err) {
      errorModal.showError(new Error(err), err);
      return;
    }
    updateSlot(
      {
        id: selectedSlot.id,
        data: {
          startAt: toLocalDateTimeString(start),
          endAt: toLocalDateTimeString(end),
          minDurationMinutes: editDraft.minDurationMinutes || 0,
        },
      },
      {
        onSuccess: () => {
          setEditDraft(null);
          setResize(null);
          resizePointerRef.current = null;
        },
        onError: errorModal.onMutationError('가용시간 수정에 실패했습니다.'),
      },
    );
  };

  const handleDeleteSelected = () => {
    if (!selectedSlot) return;
    deleteSlot(selectedSlot.id, {
      onSuccess: () => {
        setEditDraft(null);
        setResize(null);
        resizePointerRef.current = null;
      },
      onError: errorModal.onMutationError('가용시간 삭제에 실패했습니다.'),
    });
  };

  const finalizeDrag = (state: DragState) => {
    const startMinute = Math.min(state.startMinute, state.endMinute);
    const endMinute = Math.max(state.startMinute, state.endMinute);
    const err = validateSlot(state.dateStr, startMinute, endMinute);
    if (err) {
      errorModal.showError(new Error(err), err);
      setDrag(null);
      return;
    }
    setDraft({ dateStr: state.dateStr, startMinute, endMinute, minDurationMinutes: 0 });
    setDrag(null);
  };

  const handleViewBoundsPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    edge: 'top' | 'bottom',
  ) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    viewBoundsDragRef.current = {
      edge,
      startY: e.clientY,
      anchorMin: customViewHours?.minHour ?? baseBounds.minHour,
      anchorMax: customViewHours?.maxHour ?? baseBounds.maxHour,
    };
  };

  const handleViewBoundsPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!viewBoundsDragRef.current) return;

    const { edge, startY, anchorMin, anchorMax } = viewBoundsDragRef.current;
    const deltaHours = Math.round((e.clientY - startY) / DESKTOP_HOUR_HEIGHT);

    if (edge === 'bottom') {
      const maxHour = Math.min(24, Math.max(baseBounds.maxHour, anchorMax + deltaHours));
      setCustomViewHours({ minHour: anchorMin, maxHour });
      return;
    }

    const minHour = Math.max(0, Math.min(baseBounds.minHour, anchorMin + deltaHours));
    setCustomViewHours({ minHour, maxHour: anchorMax });
  };

  const handleViewBoundsPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!viewBoundsDragRef.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    viewBoundsDragRef.current = null;
  };

  const viewBoundsHandleProps = (edge: 'top' | 'bottom', overlay = false) => ({
    'data-bounds-expand-handle': true,
    $edge: edge,
    $overlay: overlay,
    'aria-label': edge === 'top' ? '시간표 위쪽 범위 조절' : '시간표 아래쪽 범위 조절',
    onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => handleViewBoundsPointerDown(e, edge),
    onPointerMove: handleViewBoundsPointerMove,
    onPointerUp: handleViewBoundsPointerUp,
    onPointerCancel: handleViewBoundsPointerUp,
  });

  const handleGridPointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    dateStr: string,
    day: Date,
  ) => {
    if (
      (e.target as HTMLElement).closest(
        '[data-hired-bar], [data-avail-bar], [data-draft-bar], [data-resize-handle], [data-past-overlay], [data-bounds-expand-handle]',
      )
    ) {
      return;
    }
    if (isDayFullyPast(dateStr, now)) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pastHeight = getPastOverlayHeight(dateStr, minHour, maxHour, DESKTOP_HOUR_HEIGHT, now);
    if (pastHeight > 0 && e.clientY - rect.top < pastHeight) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    gridPointerRef.current = { dateStr, day };
    const minute = clampEditableMinuteForDay(
      dateStr,
      yToMinutesInGrid(e.clientY - rect.top, minHour, DESKTOP_HOUR_HEIGHT),
      now,
    );
    if (minute >= 24 * 60) return;

    setDrag({ dateStr, startMinute: minute, endMinute: minute });
    setDraft(null);
    setEditDraft(null);
    setResize(null);
    resizePointerRef.current = null;
  };

  const handleResizePointerDown = (
    e: React.PointerEvent<HTMLDivElement>,
    edge: 'top' | 'bottom',
    dateStr: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const grid = e.currentTarget.closest('[data-time-grid]') as HTMLDivElement | null;
    grid?.setPointerCapture(e.pointerId);
    const state = { edge, dateStr };
    resizePointerRef.current = state;
    setResize(state);
  };

  const applyResizeMinute = (minute: number) => {
    if (!editDraft || !resizePointerRef.current) return;
    if (resizePointerRef.current.dateStr !== editDraft.dateStr) return;

    const minEditable = getMinEditableMinuteForDay(editDraft.dateStr, now);
    const { edge } = resizePointerRef.current;
    let { startMinute, endMinute } = editDraft;

    if (edge === 'top') {
      startMinute = Math.min(minute, endMinute - 15);
      startMinute = Math.max(minEditable, startMinute);
    } else {
      endMinute = Math.max(minute, startMinute + 15);
      endMinute = Math.min(24 * 60, endMinute);
    }

    setEditDraft({ ...editDraft, startMinute, endMinute });
  };

  const handleGridPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const rawMinute = yToMinutesInGrid(e.clientY - rect.top, minHour, DESKTOP_HOUR_HEIGHT);

    if (resizePointerRef.current && editDraft) {
      applyResizeMinute(rawMinute);
      return;
    }

    if (!gridPointerRef.current || !drag) return;
    const minute = clampEditableMinuteForDay(gridPointerRef.current.dateStr, rawMinute, now);
    setDrag((prev) => (prev ? { ...prev, endMinute: minute } : null));
  };

  const handleGridPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (resizePointerRef.current) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      resizePointerRef.current = null;
      setResize(null);

      if (editDraft && selectedSlot) {
        const { start, end } = daySegmentToSlotDateTimes(
          selectedSlot,
          editDraft.dateStr,
          editDraft.startMinute,
          editDraft.endMinute,
        );
        const err = validateAvailabilityRange(
          start,
          end,
          hiredByDay,
          availability,
          selectedSlot.id,
        );
        if (err) {
          errorModal.showError(new Error(err), err);
          const seg = getAvailabilitySegmentsForDay(
            selectedSlot,
            weekDays.find((d) => formatDateStr(d) === editDraft.dateStr)!,
          );
          if (seg) {
            setEditDraft({
              ...editDraft,
              startMinute: seg.startMinute,
              endMinute: seg.endMinute,
            });
          }
        }
      }
      return;
    }

    if (!gridPointerRef.current || !drag) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    const state = { ...drag };
    gridPointerRef.current = null;
    finalizeDrag(state);
  };

  const saveMobileAdd = (dateStr: string) => {
    const startMinute = timeToMinutes(mobileStart);
    const endMinute = timeToMinutes(mobileEnd);
    const err = validateSlot(dateStr, startMinute, endMinute);
    if (err) {
      errorModal.showError(new Error(err), err);
      return;
    }
    const { start, end } = buildDateTimeRange(dateStr, startMinute, endMinute);
    createSlot(
      {
        startAt: toLocalDateTimeString(start),
        endAt: toLocalDateTimeString(end),
        minDurationMinutes: mobileMin || 0,
      },
      {
        onSuccess: () => {
          setMobileAddDate(null);
          setMobileStart('09:00');
          setMobileEnd('18:00');
          setMobileMin(0);
        },
        onError: errorModal.onMutationError('가용시간 등록에 실패했습니다.'),
      },
    );
  };

  const renderBarPosition = (startMinute: number, endMinute: number) => ({
    topDesktop: ((startMinute - minHour * 60) / 60) * DESKTOP_HOUR_HEIGHT,
    heightDesktop: Math.max(((endMinute - startMinute) / 60) * DESKTOP_HOUR_HEIGHT, 48),
    topTablet: ((startMinute - minHour * 60) / 60) * TABLET_HOUR_HEIGHT,
    heightTablet: Math.max(((endMinute - startMinute) / 60) * TABLET_HOUR_HEIGHT, 44),
  });

  return (
    <>
      <S.WeekNavSection>
        <S.NavRow>
          <S.NavButton type="button" onClick={onPrev} aria-label="이전 주">
            <ChevronLeft size={20} />
          </S.NavButton>
          <S.MonthTitle>
            {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {weekNum}주차 — 가용시간
          </S.MonthTitle>
          <S.NavButton type="button" onClick={onNext} aria-label="다음 주">
            <ChevronRight size={20} />
          </S.NavButton>
        </S.NavRow>
      </S.WeekNavSection>

      <S.IntroSection>
        <S.IntroSummaryCard>
          <S.IntroSummaryText>
            <strong>가용시간</strong>은 일할 수 있는 날·시간을 미리 등록해 두는 기능입니다. 맞는
            공고가 올라오면 <strong>자동으로 지원</strong>될 수 있어요.
          </S.IntroSummaryText>
          <S.IntroToggle
            type="button"
            onClick={() => setIsIntroExpanded((prev) => !prev)}
            aria-expanded={isIntroExpanded}
          >
            {isIntroExpanded ? '간단히 보기' : '자세히 보기'}
            <ChevronDown size={16} className={isIntroExpanded ? 'expanded' : ''} />
          </S.IntroToggle>
        </S.IntroSummaryCard>

        {isIntroExpanded && (
          <S.IntroGuide>
            <S.IntroTitle>가용시간이란?</S.IntroTitle>
            <S.IntroLead>
              일할 수 있는 <strong>날짜와 시간</strong>을 미리 적어 두는 기능입니다. 등록해 두면,
              그 시간에 맞는 공고가 올라왔을 때 <strong>자동으로 지원</strong>이 연결될 수
              있습니다.
            </S.IntroLead>

            <S.IntroGrid>
              <S.IntroBlock>
                <S.IntroBlockTitle>왜 필요한가요?</S.IntroBlockTitle>
                <ul>
                  <li>매번 공고를 찾아 직접 지원하지 않아도 됩니다.</li>
                  <li>내 일정(채용 확정 근무)과 겹치지 않는 시간만 등록하면 됩니다.</li>
                  <li>최소 근무 시간을 정해 두면, 너무 짧은 공고는 걸러집니다.</li>
                </ul>
              </S.IntroBlock>
              <S.IntroBlock>
                <S.IntroBlockTitle>등록 방법</S.IntroBlockTitle>
                <ul>
                  <li className="desktop-only">
                    <strong>PC·태블릿(가로)</strong>: 빈 칸을 드래그해 새로 등록하거나, 등록된
                    블록을 선택한 뒤 위·아래 가장자리를 드래그해 시간을 조절하세요.
                  </li>
                  <li className="mobile-only">
                    <strong>모바일</strong>: 해당 요일의 「+ 가용시간 추가」에서 시작·종료 시간과
                    최소 근무 시간을 입력하세요.
                  </li>
                  <li>회색 블록(채용 확정 근무) 위에는 등록할 수 없습니다.</li>
                </ul>
              </S.IntroBlock>
            </S.IntroGrid>
          </S.IntroGuide>
        )}

        <S.Legend>
          <S.LegendItem>
            <S.LegendSwatch $variant="hired" />
            채용 확정
          </S.LegendItem>
          <S.LegendItem>
            <S.LegendSwatch $variant="avail" />
            내 가용시간
          </S.LegendItem>
          <S.LegendItem>
            <S.LegendSwatch $variant="past" />
            지난 시간
          </S.LegendItem>
        </S.Legend>
      </S.IntroSection>

      {isLoading ? (
        <S.EmptyMessage>가용시간을 불러오는 중...</S.EmptyMessage>
      ) : (
        <>
          {/* 모바일 리스트 */}
          <S.ListView>
            {weekDays.map((day, idx) => {
              const dateStr = formatDateStr(day);
              const dayHired = hiredByDay[dateStr] || [];
              const dayAvail = availability
                .map((slot) => getAvailabilitySegmentsForDay(slot, day))
                .filter((s): s is NonNullable<typeof s> => s !== null);
              const isSaturday = idx === 5;
              const isSunday = idx === 6;
              const isToday = dateStr === todayStr;

              return (
                <S.ListDayGroup key={dateStr}>
                  <S.ListDayHeader $isSaturday={isSaturday} $isSunday={isSunday} $isToday={isToday}>
                    <span className="label">{DAYS_KR[idx]}</span>
                    <span className="date">{day.getDate()}일</span>
                  </S.ListDayHeader>

                  {dayHired.map((s) => {
                    const isHiredSelected = selectedJobPostId === s.jobPostId;
                    return (
                      <S.ListCard
                        key={`hired-${s.jobPostId}`}
                        type="button"
                        $variant="hired"
                        $selected={isHiredSelected}
                        onClick={() => {
                          setSelectedJobPostId(isHiredSelected ? null : s.jobPostId);
                        }}
                      >
                        <S.ListCardTitle>{s.title}</S.ListCardTitle>
                        <S.ListCardBadge $variant="hired">채용 확정</S.ListCardBadge>
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

                  {dayAvail.map(({ slot, startMinute, endMinute }) => (
                    <S.ListCard
                      key={`avail-${slot.id}-${dateStr}`}
                      type="button"
                      $variant="avail"
                      $selected={editDraft?.slotId === slot.id && editDraft.dateStr === dateStr}
                      onClick={() => {
                        selectAvailability(slot, dateStr, startMinute, endMinute);
                      }}
                    >
                      <S.ListCardTitle>
                        <CalendarClock size={14} strokeWidth={2.25} aria-hidden />
                        가용시간
                      </S.ListCardTitle>
                      <S.ListCardBadge $variant="avail">가용</S.ListCardBadge>
                      <S.ListCardMeta>
                        <Clock size={14} />
                        {minutesToTime(startMinute)} - {minutesToTime(endMinute)}
                      </S.ListCardMeta>
                      <S.ListCardMeta>최소 근무 {slot.minDurationMinutes}분</S.ListCardMeta>
                    </S.ListCard>
                  ))}

                  {mobileAddDate === dateStr ? (
                    <S.MobileForm>
                      <S.MobileRow>
                        <label>시작</label>
                        <input type="time" value={mobileStart} onChange={(e) => setMobileStart(e.target.value)} />
                      </S.MobileRow>
                      <S.MobileRow>
                        <label>종료</label>
                        <input type="time" value={mobileEnd} onChange={(e) => setMobileEnd(e.target.value)} />
                      </S.MobileRow>
                      <S.MobileRow>
                        <label>최소 근무(분)</label>
                        <input
                          type="number"
                          min={0}
                          step={15}
                          value={mobileMin}
                          onChange={(e) => setMobileMin(Number(e.target.value))}
                        />
                      </S.MobileRow>
                      <S.MobileActions>
                        <Button type="button" scheme="primary" buttonSize="xsmall" onClick={() => saveMobileAdd(dateStr)}>
                          저장
                        </Button>
                        <Button type="button" scheme="secondary" buttonSize="xsmall" onClick={() => setMobileAddDate(null)}>
                          취소
                        </Button>
                      </S.MobileActions>
                    </S.MobileForm>
                  ) : !isDayFullyPast(dateStr, now) ? (
                    <Button
                      type="button"
                      scheme="secondary"
                      buttonSize="small"
                      style={{ width: '100%' }}
                      onClick={() => {
                        setMobileAddDate(dateStr);
                        setDraft(null);
                        setEditDraft(null);
                      }}
                    >
                      + 가용시간 추가
                    </Button>
                  ) : null}
                </S.ListDayGroup>
              );
            })}
          </S.ListView>

          {/* 데스크톱 그리드 */}
          <S.GridWrapper>
            <S.TimeColumn>
              <S.DayHeaderPlaceholder />
              <S.TimeLabelsBlock>
                {hours.map((h) => (
                  <S.TimeLabel key={h} $desktopHeight={DESKTOP_HOUR_HEIGHT} $tabletHeight={TABLET_HOUR_HEIGHT}>
                    {formatHour(h)}
                  </S.TimeLabel>
                ))}
              </S.TimeLabelsBlock>
            </S.TimeColumn>

            <S.DayGridsArea>
              <S.DayHeadersRow>
                {weekDays.map((day, idx) => {
                  const dateStr = formatDateStr(day);
                  const isSaturday = idx === 5;
                  const isSunday = idx === 6;
                  const isToday = dateStr === todayStr;

                  return (
                    <S.DayHeaderCell key={dateStr}>
                      <S.DayHeader $isSaturday={isSaturday} $isSunday={isSunday} $isToday={isToday}>
                        <span className="label">{DAYS_KR[idx]}</span>
                        <span className="date">{day.getDate()}</span>
                      </S.DayHeader>
                    </S.DayHeaderCell>
                  );
                })}
              </S.DayHeadersRow>

              <S.DayGridsRow $heightDesktop={gridHeightDesktop} $heightTablet={gridHeightTablet}>
                <S.ViewBoundsHandle {...viewBoundsHandleProps('top', true)} />
                <S.SharedHourLines>
                  {hours.map((_, i) => (
                    <S.HourLine
                      key={i}
                      $index={i}
                      $desktopHeight={DESKTOP_HOUR_HEIGHT}
                      $tabletHeight={TABLET_HOUR_HEIGHT}
                    />
                  ))}
                </S.SharedHourLines>
                <S.ViewBoundsHandle {...viewBoundsHandleProps('bottom', true)} />

                {weekDays.map((day) => {
              const dateStr = formatDateStr(day);
              const dayHired = hiredByDay[dateStr] || [];
              const dayAvail = availability
                .map((slot) => getAvailabilitySegmentsForDay(slot, day))
                .filter((s): s is NonNullable<typeof s> => s !== null);

              const showDrag =
                drag?.dateStr === dateStr
                  ? {
                      start: Math.min(drag.startMinute, drag.endMinute),
                      end: Math.max(drag.startMinute, drag.endMinute),
                    }
                  : null;
              const showDraft = draft?.dateStr === dateStr ? draft : null;
              const dayFullyPast = isDayFullyPast(dateStr, now);
              const pastOverlayHeight = dayFullyPast
                ? gridHeightDesktop
                : getPastOverlayHeight(dateStr, minHour, maxHour, DESKTOP_HOUR_HEIGHT, now);

              return (
                <S.DayGridColumn key={dateStr}>
                  <S.TimeGrid
                    data-time-grid
                    $heightDesktop={gridHeightDesktop}
                    $heightTablet={gridHeightTablet}
                    onPointerDown={(e) => handleGridPointerDown(e, dateStr, day)}
                    onPointerMove={handleGridPointerMove}
                    onPointerUp={handleGridPointerUp}
                    onPointerLeave={handleGridPointerUp}
                  >
                    {pastOverlayHeight > 0 && (
                      <S.PastOverlay data-past-overlay $height={pastOverlayHeight} />
                    )}

                    {dayHired.map((s) => {
                      const isSelected = selectedJobPostId === s.jobPostId;
                      const pos = renderBarPosition(
                        timeToMinutes(s.workStart),
                        timeToMinutes(s.workEnd),
                      );

                      return (
                        <S.HiredBar
                          key={s.jobPostId}
                          data-hired-bar
                          $selected={isSelected}
                          $topDesktop={pos.topDesktop}
                          $heightDesktop={pos.heightDesktop}
                          $topTablet={pos.topTablet}
                          $heightTablet={pos.heightTablet}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJobPostId(isSelected ? null : s.jobPostId);
                          }}
                        >
                          <S.BarTitle $wrap>{s.title}</S.BarTitle>
                          <S.BarMeta>
                            <Clock size={10} /> {s.workStart} - {s.workEnd}
                          </S.BarMeta>
                        </S.HiredBar>
                      );
                    })}

                    {dayAvail.map(({ slot, startMinute, endMinute }) => {
                      const isEditing =
                        editDraft?.slotId === slot.id && editDraft.dateStr === dateStr;
                      const displayStart = isEditing ? editDraft.startMinute : startMinute;
                      const displayEnd = isEditing ? editDraft.endMinute : endMinute;
                      const pos = renderBarPosition(displayStart, displayEnd);
                      const isSelected = isEditing;
                      return (
                        <S.AvailBar
                          key={`${slot.id}-${dateStr}`}
                          data-avail-bar
                          $selected={isSelected}
                          $isResizing={!!resize && isSelected}
                          $topDesktop={pos.topDesktop}
                          $heightDesktop={pos.heightDesktop}
                          $topTablet={pos.topTablet}
                          $heightTablet={pos.heightTablet}
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAvailability(slot, dateStr, startMinute, endMinute);
                          }}
                        >
                          {isSelected && (
                            <>
                              <S.ResizeHandle
                                data-resize-handle
                                $edge="top"
                                aria-label="시작 시간 조절"
                                onPointerDown={(e) => handleResizePointerDown(e, 'top', dateStr)}
                              />
                              <S.ResizeHandle
                                data-resize-handle
                                $edge="bottom"
                                aria-label="종료 시간 조절"
                                onPointerDown={(e) => handleResizePointerDown(e, 'bottom', dateStr)}
                              />
                            </>
                          )}
                          <S.AvailBarLabel>
                            <S.AvailBarIcon aria-hidden>
                              <CalendarClock size={13} strokeWidth={2.25} />
                            </S.AvailBarIcon>
                            <S.BarTitle $light>가용시간</S.BarTitle>
                          </S.AvailBarLabel>
                          <S.BarMeta $light>
                            {minutesToTime(displayStart)} - {minutesToTime(displayEnd)}
                          </S.BarMeta>
                          <S.BarMeta $light>
                            최소{' '}
                            {isEditing ? editDraft.minDurationMinutes : slot.minDurationMinutes}분
                          </S.BarMeta>
                        </S.AvailBar>
                      );
                    })}

                    {showDrag && (
                      <S.DragPreview
                        $topDesktop={renderBarPosition(showDrag.start, showDrag.end).topDesktop}
                        $heightDesktop={renderBarPosition(showDrag.start, showDrag.end).heightDesktop}
                        $topTablet={renderBarPosition(showDrag.start, showDrag.end).topTablet}
                        $heightTablet={renderBarPosition(showDrag.start, showDrag.end).heightTablet}
                      />
                    )}

                    {showDraft && (
                      <S.DraftBar
                        data-draft-bar
                        $topDesktop={renderBarPosition(showDraft.startMinute, showDraft.endMinute).topDesktop}
                        $heightDesktop={
                          renderBarPosition(showDraft.startMinute, showDraft.endMinute).heightDesktop
                        }
                        $topTablet={renderBarPosition(showDraft.startMinute, showDraft.endMinute).topTablet}
                        $heightTablet={
                          renderBarPosition(showDraft.startMinute, showDraft.endMinute).heightTablet
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        <S.DraftLabel>
                          <CalendarClock size={12} strokeWidth={2.25} aria-hidden />
                          가용시간 등록
                        </S.DraftLabel>
                        <S.DraftTime>
                          {minutesToTime(Math.min(showDraft.startMinute, showDraft.endMinute))} -{' '}
                          {minutesToTime(Math.max(showDraft.startMinute, showDraft.endMinute))}
                        </S.DraftTime>
                        <S.MinRow>
                          <span>최소 근무</span>
                          <input
                            type="number"
                            min={0}
                            step={15}
                            value={showDraft.minDurationMinutes}
                            onChange={(e) =>
                              setDraft({ ...showDraft, minDurationMinutes: Number(e.target.value) })
                            }
                          />
                          <span>분</span>
                        </S.MinRow>
                        <S.DraftActions>
                          <button type="button" onClick={saveDraft} disabled={isCreating}>
                            {isCreating ? '저장 중...' : '저장'}
                          </button>
                          <button type="button" onClick={() => setDraft(null)}>
                            취소
                          </button>
                        </S.DraftActions>
                      </S.DraftBar>
                    )}

                  </S.TimeGrid>
                </S.DayGridColumn>
              );
            })}
              </S.DayGridsRow>
            </S.DayGridsArea>
          </S.GridWrapper>

          {selectedSlot && editDraft && (
            <S.EditPanel>
              <span>
                선택한 가용시간 · {minutesToTime(editDraft.startMinute)} -{' '}
                {minutesToTime(editDraft.endMinute)}
                <S.EditHint>(표에서 위·아래 가장자리를 드래그해 조절)</S.EditHint>
              </span>
              <S.EditTimeRow>
                <span>시작</span>
                <input
                  type="time"
                  value={minutesToTime(editDraft.startMinute)}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, startMinute: timeToMinutes(e.target.value) })
                  }
                />
              </S.EditTimeRow>
              <S.EditTimeRow>
                <span>종료</span>
                <input
                  type="time"
                  value={minutesToTime(editDraft.endMinute)}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, endMinute: timeToMinutes(e.target.value) })
                  }
                />
              </S.EditTimeRow>
              <S.MinRow>
                <span>최소 근무</span>
                <input
                  type="number"
                  min={0}
                  step={15}
                  value={editDraft.minDurationMinutes}
                  onChange={(e) =>
                    setEditDraft({ ...editDraft, minDurationMinutes: Number(e.target.value) })
                  }
                />
                <span>분</span>
              </S.MinRow>
              <S.EditActions>
                <Button
                  type="button"
                  scheme="primary"
                  buttonSize="xsmall"
                  onClick={saveSelectedEdit}
                  disabled={isUpdating}
                >
                  {isUpdating ? '저장 중...' : '저장'}
                </Button>
                <Button
                  type="button"
                  scheme="secondary"
                  buttonSize="xsmall"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                >
                  <Trash2 size={14} />
                  삭제
                </Button>
                <Button
                  type="button"
                  scheme="secondary"
                  buttonSize="xsmall"
                  onClick={() => {
                    setEditDraft(null);
                    setResize(null);
                    resizePointerRef.current = null;
                  }}
                >
                  닫기
                </Button>
              </S.EditActions>
            </S.EditPanel>
          )}
        </>
      )}

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </>
  );
};

const S = {
  WeekNavSection: styled.header`
    ${calendarHeaderCss}
    padding-bottom: 16px;
    margin-bottom: 0;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
  `,
  IntroSection: styled.section`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 0 20px;
    margin-bottom: 8px;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
  `,
  IntroSummaryCard: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
  `,
  IntroSummaryText: styled.p`
    margin: 0;
    flex: 1;
    min-width: 200px;
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.55;
    color: ${({ theme }) => theme.color.text};

    strong {
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
      color: ${({ theme }) => theme.color.tertiary};
    }
  `,
  IntroToggle: styled.button`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    padding: 6px 12px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.round};
    background: ${({ theme }) => theme.color.white};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    color: ${({ theme }) => theme.color.subText};
    cursor: pointer;

    svg {
      transition: transform 0.2s ease;
    }

    svg.expanded {
      transform: rotate(180deg);
    }

    &:hover {
      border-color: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.primary};
    }
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
    &:hover {
      background-color: ${({ theme }) => theme.color.background};
    }
  `,
  IntroGuide: styled.div`
    padding: 16px 18px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.border};
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  IntroTitle: styled.h3`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  IntroLead: styled.p`
    margin: 0;
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.55;
    color: ${({ theme }) => theme.color.text};

    strong {
      font-weight: ${({ theme }) => theme.fontWeight.semibold};
      color: ${({ theme }) => theme.color.tertiary};
    }
  `,
  IntroGrid: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px 20px;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      grid-template-columns: 1fr;
    }
  `,
  IntroBlock: styled.div`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    line-height: 1.55;
    color: ${({ theme }) => theme.color.subText};

    ul {
      margin: 6px 0 0;
      padding-left: 18px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    li strong {
      color: ${({ theme }) => theme.color.text};
    }

    .desktop-only {
      @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
        display: none;
      }
    }

    .mobile-only {
      display: none;

      @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
        display: list-item;
      }
    }
  `,
  IntroBlockTitle: styled.span`
    display: block;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  Legend: styled.div`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px 16px;
  `,
  LegendItem: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  LegendSwatch: styled.span<{ $variant: 'hired' | 'avail' | 'past' }>`
    width: 12px;
    height: 12px;
    border-radius: 3px;
    background: ${({ theme, $variant }) => {
      if ($variant === 'hired') return theme.color.background;
      if ($variant === 'past') {
        return `color-mix(in srgb, ${theme.color.subBackground} 32%, transparent)`;
      }
      return theme.badgeScheme.success.backgroundColor;
    }};
    border: 1px solid
      ${({ theme, $variant }) => {
        if ($variant === 'hired') return theme.color.border;
        if ($variant === 'past') {
          return `color-mix(in srgb, ${theme.color.subText} 30%, transparent)`;
        }
        return theme.color.tertiary;
      }};
  `,
  EmptyMessage: styled.p`
    text-align: center;
    padding: 40px 20px;
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
  ListCard: styled.button<{ $variant: 'hired' | 'avail'; $selected?: boolean }>`
    width: 100%;
    text-align: left;
    padding: 12px 14px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background-color: ${({ theme, $variant, $selected }) => {
      if ($variant === 'hired') {
        return $selected ? theme.color.secondary : theme.color.background;
      }
      return theme.badgeScheme.success.backgroundColor;
    }};
    border: ${({ theme, $variant, $selected }) => {
      if ($variant === 'hired') {
        return $selected ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`;
      }
      return $selected ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.tertiary}`;
    }};
    color: ${({ theme, $variant }) =>
      $variant === 'avail' ? theme.color.white : theme.color.text};
    display: flex;
    flex-direction: column;
    gap: 6px;
    cursor: pointer;
    ${hoverOverlay}

    ${({ theme, $variant }) =>
      $variant === 'avail' &&
      css`
        & > span {
          color: color-mix(in srgb, ${theme.color.white} 92%, transparent);
        }

        svg {
          color: ${theme.color.white};
          stroke: currentColor;
        }
      `}
  `,
  ListCardTitle: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  `,
  ListCardBadge: styled.span<{ $variant: 'hired' | 'avail' }>`
    align-self: flex-start;
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 999px;
    background: ${({ theme, $variant }) =>
      $variant === 'hired'
        ? theme.color.border
        : `color-mix(in srgb, ${theme.color.white} 22%, transparent)`};
    color: ${({ theme, $variant }) =>
      $variant === 'hired' ? theme.color.subText : theme.color.white};
  `,
  ListCardMeta: styled.span`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  MobileForm: styled.div`
    padding: 12px;
    border: 1px dashed ${({ theme }) => theme.color.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    display: flex;
    flex-direction: column;
    gap: 8px;
    background: ${({ theme }) => theme.badgeScheme.success.backgroundColor};
  `,
  MobileRow: styled.label`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};

    input {
      flex: 1;
      max-width: 140px;
      padding: 6px 8px;
      border: 1px solid ${({ theme }) => theme.color.border};
      border-radius: ${({ theme }) => theme.borderRadius.small};
    }

    input[type='time'] {
      min-width: 132px;
      max-width: none;
      flex: 0 0 132px;
      padding: 8px 10px;
    }
  `,
  MobileActions: styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  `,
  GridWrapper: styled.div`
    display: flex;
    gap: 0;
    overflow-x: auto;
    min-width: 0;
    position: relative;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      display: none;
    }
  `,
  ViewBoundsHandle: styled.div<{ $edge: 'top' | 'bottom'; $overlay?: boolean }>`
    height: 12px;
    flex-shrink: 0;
    cursor: ns-resize;
    touch-action: none;
    position: relative;

    ${({ $overlay, $edge }) =>
      $overlay &&
      `
      position: absolute;
      left: 0;
      right: 0;
      z-index: 6;
      ${$edge === 'top' ? 'top: 0;' : 'bottom: 0;'}
    `}

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      /* 요일 칸 약 3개 분량 (7열 기준 ~43%) */
      width: clamp(180px, 43%, 420px);
      width: 60px;
      height: 5px;
      border-radius: 3px;
      background: ${({ theme }) => theme.color.subText};
      opacity: 0.45;
      ${({ $edge }) => ($edge === 'top' ? 'bottom: 2px;' : 'top: 2px;')}
    }

    &:hover::after {
      opacity: 0.75;
      background: ${({ theme }) => theme.color.primary};
    }
  `,
  TimeColumn: styled.div`
    flex-shrink: 0;
    width: 60px;
    position: sticky;
    left: 0;
    z-index: 3;
    background-color: ${({ theme }) => theme.color.white};
  `,
  DayHeaderPlaceholder: styled.div`
    height: 56px;
    flex-shrink: 0;
  `,
  TimeLabelsBlock: styled.div`
    display: flex;
    flex-direction: column;
  `,
  DayGridsArea: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  `,
  DayHeadersRow: styled.div`
    display: flex;
  `,
  DayHeaderCell: styled.div`
    flex: 1;
    min-width: 120px;
    border-left: 1px solid color-mix(in srgb, ${({ theme }) => theme.color.border}, transparent 40%);
  `,
  DayGridsRow: styled.div<{ $heightDesktop: number; $heightTablet: number }>`
    display: flex;
    position: relative;
    height: ${({ $heightDesktop }) => $heightDesktop}px;
    min-height: ${({ $heightDesktop }) => $heightDesktop}px;
  `,
  SharedHourLines: styled.div`
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  `,
  DayGridColumn: styled.div`
    flex: 1;
    min-width: 120px;
    border-left: 1px solid color-mix(in srgb, ${({ theme }) => theme.color.border}, transparent 40%);
    position: relative;
    z-index: 1;
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
      font-size: ${({ theme }) => theme.fontSize.xsmall};
      color: ${({ theme, $isToday }) => ($isToday ? theme.color.primary : theme.color.subText)};
    }

    .date {
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
    }
  `,
  TimeGrid: styled.div<{ $heightDesktop: number; $heightTablet: number }>`
    position: relative;
    height: ${({ $heightDesktop }) => $heightDesktop}px;
    cursor: crosshair;
    touch-action: none;
    background: transparent;
  `,
  PastOverlay: styled.div<{ $height: number }>`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: ${({ $height }) => $height}px;
    background: color-mix(
      in srgb,
      ${({ theme }) => theme.color.subBackground} 32%,
      transparent
    );
    border-bottom: 1px dashed
      color-mix(in srgb, ${({ theme }) => theme.color.subText} 22%, transparent);
    pointer-events: none;
    z-index: 1;
  `,
  HourLine: styled.div<{ $index: number; $desktopHeight: number; $tabletHeight: number }>`
    position: absolute;
    left: 0;
    right: 0;
    height: 1px;
    background-color: ${({ theme }) => theme.color.border};
    opacity: 0.5;
    top: ${({ $index, $desktopHeight }) => $index * $desktopHeight}px;
    pointer-events: none;
  `,
  HiredBar: styled.div<{
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
    z-index: 4;
    pointer-events: auto;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-x: hidden;
    overflow-y: auto;
    ${hoverOverlay}
  `,
  AvailBar: styled.div<{
    $selected: boolean;
    $isResizing?: boolean;
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
    padding: 6px 8px;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    background-color: ${({ theme }) => theme.badgeScheme.success.backgroundColor};
    color: ${({ theme }) => theme.color.white};
    border: ${({ theme, $selected, $isResizing }) =>
      $selected || $isResizing
        ? `2px solid ${theme.color.primary}`
        : `1px solid ${theme.color.tertiary}`};
    z-index: ${({ $selected }) => ($selected ? 5 : 2)};
    pointer-events: auto;
    cursor: ${({ $selected }) => ($selected ? 'default' : 'pointer')};
    overflow: visible;
    box-shadow: ${({ theme, $selected }) =>
      $selected ? theme.shadow.default : 'none'};

    svg {
      color: ${({ theme }) => theme.color.white};
      stroke: currentColor;
    }
  `,
  ResizeHandle: styled.div<{ $edge: 'top' | 'bottom' }>`
    position: absolute;
    left: 0;
    right: 0;
    height: 12px;
    cursor: ns-resize;
    z-index: 3;
    touch-action: none;

    ${({ $edge }) =>
      $edge === 'top'
        ? `
      top: -4px;
    `
        : `
      bottom: -4px;
    `}

    &::after {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 4px;
      border-radius: 2px;
      background: ${({ theme }) => theme.color.tertiary};
      opacity: 0.5;
      ${({ $edge }) => ($edge === 'top' ? 'top: 4px;' : 'bottom: 4px;')}
    }
  `,
  EditHint: styled.span`
    display: block;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    font-weight: ${({ theme }) => theme.fontWeight.regular};
    margin-top: 2px;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      display: none;
    }
  `,
  DragPreview: styled.div<{
    $topDesktop: number;
    $heightDesktop: number;
    $topTablet: number;
    $heightTablet: number;
  }>`
    position: absolute;
    left: 6px;
    width: calc(100% - 12px);
    top: ${({ $topDesktop }) => $topDesktop}px;
    height: ${({ $heightDesktop }) => $heightDesktop}px;
    border: 2px dashed ${({ theme }) => theme.color.tertiary};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    background: color-mix(in srgb, ${({ theme }) => theme.color.tertiary}, transparent 85%);
    z-index: 1;
    pointer-events: none;
  `,
  DraftBar: styled.div<{
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
    min-height: 88px;
    padding: 8px;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    background: ${({ theme }) => theme.color.white};
    border: 2px solid ${({ theme }) => theme.color.tertiary};
    z-index: 4;
    pointer-events: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
    box-shadow: ${({ theme }) => theme.shadow.default};
  `,
  DraftLabel: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.tertiary};
  `,
  DraftTime: styled.span`
    font-size: 10px;
    color: ${({ theme }) => theme.color.subText};
  `,
  MinRow: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};

    input {
      width: 56px;
      padding: 4px 6px;
      border: 1px solid ${({ theme }) => theme.color.border};
      border-radius: ${({ theme }) => theme.borderRadius.small};
    }
  `,
  DraftActions: styled.div`
    display: flex;
    gap: 6px;
    margin-top: auto;

    button {
      flex: 1;
      padding: 4px 0;
      font-size: ${({ theme }) => theme.fontSize.xsmall};
      border-radius: ${({ theme }) => theme.borderRadius.small};
      cursor: pointer;
      border: none;

      &:first-child {
        background: ${({ theme }) => theme.color.tertiary};
        color: ${({ theme }) => theme.color.white};
      }

      &:last-child {
        background: ${({ theme }) => theme.color.background};
        color: ${({ theme }) => theme.color.subText};
      }
    }
  `,
  BarTitle: styled.span<{ $light?: boolean; $wrap?: boolean }>`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme, $light }) => ($light ? theme.color.white : 'inherit')};
    line-height: 1.35;
    flex-shrink: 0;

    ${({ $wrap }) =>
      $wrap
        ? `
      white-space: normal;
      word-break: keep-all;
      overflow-wrap: break-word;
    `
        : `
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    `}
  `,
  AvailBarLabel: styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    color: ${({ theme }) => theme.color.white};
  `,
  AvailBarIcon: styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    border-radius: 4px;
    color: ${({ theme }) => theme.color.white};
    background: color-mix(in srgb, ${({ theme }) => theme.color.white} 24%, transparent);
  `,
  BarMeta: styled.span<{ $light?: boolean }>`
    display: flex;
    align-items: center;
    gap: 3px;
    font-size: 10px;
    flex-shrink: 0;
    color: ${({ theme, $light }) =>
      $light
        ? `color-mix(in srgb, ${theme.color.white} 88%, transparent)`
        : `color-mix(in srgb, currentColor 88%, transparent)`};

    svg {
      color: inherit;
      stroke: currentColor;
    }
  `,
  EditTimeRow: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    font-size: ${({ theme }) => theme.fontSize.xsmall};

    > span:first-child {
      flex-shrink: 0;
      min-width: 2.5em;
    }

    input[type='time'] {
      min-width: 132px;
      width: 132px;
      padding: 8px 10px;
      border: 1px solid ${({ theme }) => theme.color.border};
      border-radius: ${({ theme }) => theme.borderRadius.small};
      font-size: ${({ theme }) => theme.fontSize.small};
      font-family: inherit;
      box-sizing: border-box;
    }
  `,
  EditPanel: styled.div`
    margin-top: 16px;
    padding: 12px 16px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    font-size: ${({ theme }) => theme.fontSize.small};
  `,
  EditActions: styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  `,
};
