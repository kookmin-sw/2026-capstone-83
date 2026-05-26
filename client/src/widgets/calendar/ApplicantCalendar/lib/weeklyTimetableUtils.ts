import type { ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import type { WorkerAvailabilityResponse } from 'entities/workerAvailability/model/types/workerAvailability.type';

export const DAYS_KR = ['월', '화', '수', '목', '금', '토', '일'] as const;

export const DESKTOP_HOUR_HEIGHT = 60;
export const TABLET_HOUR_HEIGHT = 48;
export const SNAP_MINUTES = 15;

export const getWeekDays = (date: Date) => {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day === 0 ? 7 : day) - 1));
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

export const getWeekNumber = (date: Date) => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  return Math.ceil((date.getDate() + firstDay.getDay()) / 7);
};

export const formatDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const timeToMinutes = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m || 0);
};

export const minutesToTime = (total: number) => {
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const formatHour = (hour: number) => {
  const period = hour < 12 ? 'AM' : 'PM';
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${String(h).padStart(2, '0')} ${period}`;
};

export const snapMinutes = (minutes: number) =>
  Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;

export const parseLocalDateTime = (iso: string) => new Date(iso);

export const toLocalDateTimeString = (date: Date) => {
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${mo}-${d}T${h}:${mi}:00`;
};

export const rangesOverlap = (aStart: number, aEnd: number, bStart: number, bEnd: number) =>
  aStart < bEnd && bStart < aEnd;

/** 해당 날짜와 겹치는 구간만 분 단위(0=자정)로 반환 */
export const clipIntervalToDay = (
  rangeStart: Date,
  rangeEnd: Date,
  day: Date,
): { startMinute: number; endMinute: number } | null => {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const start = Math.max(rangeStart.getTime(), dayStart.getTime());
  const end = Math.min(rangeEnd.getTime(), dayEnd.getTime());
  if (end <= start) return null;

  const startMinute = Math.floor((start - dayStart.getTime()) / 60000);
  const endMinute = Math.floor((end - dayStart.getTime()) / 60000);
  return { startMinute, endMinute };
};

export const getHiredSchedulesForWeek = (
  schedules: Record<string, ApplicantSchedule[]>,
  weekDays: Date[],
) => {
  const hiredSchedules: Record<string, ApplicantSchedule[]> = {};
  weekDays.forEach((day) => {
    const dateStr = formatDateStr(day);
    const daySchedules = schedules[dateStr] || [];
    const hired = daySchedules.filter((s) => s.applyStatus === 'HIRED');
    if (hired.length > 0) hiredSchedules[dateStr] = hired;
  });
  return hiredSchedules;
};

export const getAvailabilitySegmentsForDay = (
  slot: WorkerAvailabilityResponse,
  day: Date,
) => {
  const start = parseLocalDateTime(slot.startAt);
  const end = parseLocalDateTime(slot.endAt);
  const clipped = clipIntervalToDay(start, end, day);
  if (!clipped) return null;
  return { slot, ...clipped };
};

export const computeHourBounds = (
  hiredByDay: Record<string, ApplicantSchedule[]>,
  availability: WorkerAvailabilityResponse[],
  weekDays: Date[],
  draft?: { startMinute: number; endMinute: number } | null,
) => {
  let minHour = 24;
  let maxHour = 0;

  const bump = (startMin: number, endMin: number) => {
    const startH = Math.floor(startMin / 60);
    const endH = Math.ceil(endMin / 60);
    if (startH < minHour) minHour = startH;
    if (endH > maxHour) maxHour = endH;
  };

  Object.values(hiredByDay).flat().forEach((s) => {
    bump(timeToMinutes(s.workStart), timeToMinutes(s.workEnd));
  });

  weekDays.forEach((day) => {
    availability.forEach((slot) => {
      const seg = getAvailabilitySegmentsForDay(slot, day);
      if (seg) bump(seg.startMinute, seg.endMinute);
    });
  });

  if (draft) bump(draft.startMinute, draft.endMinute);

  if (minHour === 24) {
    minHour = 9;
    maxHour = 18;
  }
  minHour = Math.max(0, minHour - 1);
  maxHour = Math.min(24, maxHour + 1);
  if (maxHour - minHour < 6) maxHour = minHour + 6;

  const hours = Array.from({ length: maxHour - minHour }, (_, i) => minHour + i);
  return { minHour, maxHour, hours };
};

export const yToMinutesInGrid = (
  offsetY: number,
  minHour: number,
  hourHeight: number,
) => snapMinutes(minHour * 60 + (offsetY / hourHeight) * 60);

export const overlapsHiredOnDay = (
  dateStr: string,
  startMinute: number,
  endMinute: number,
  hiredByDay: Record<string, ApplicantSchedule[]>,
) => {
  const hired = hiredByDay[dateStr] || [];
  return hired.some((s) =>
    rangesOverlap(startMinute, endMinute, timeToMinutes(s.workStart), timeToMinutes(s.workEnd)),
  );
};

export const overlapsAvailabilityOnDay = (
  day: Date,
  startMinute: number,
  endMinute: number,
  availability: WorkerAvailabilityResponse[],
  excludeId?: number,
) => {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const rangeStart = new Date(dayStart);
  rangeStart.setMinutes(startMinute);
  const rangeEnd = new Date(dayStart);
  rangeEnd.setMinutes(endMinute);

  return availability.some((slot) => {
    if (excludeId !== undefined && slot.id === excludeId) return false;
    const seg = getAvailabilitySegmentsForDay(slot, day);
    if (!seg) return false;
    return rangesOverlap(startMinute, endMinute, seg.startMinute, seg.endMinute);
  });
};

export const buildDateTimeRange = (dateStr: string, startMinute: number, endMinute: number) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  start.setMinutes(startMinute);
  const end = new Date(y, m - 1, d, 0, 0, 0, 0);
  end.setMinutes(endMinute);
  return { start, end };
};

/** 해당 요일 구간 드래그 결과를 슬롯 전체 startAt/endAt으로 반영 */
export const daySegmentToSlotDateTimes = (
  slot: WorkerAvailabilityResponse,
  dateStr: string,
  startMinute: number,
  endMinute: number,
): { start: Date; end: Date } => {
  const globalStart = parseLocalDateTime(slot.startAt);
  const globalEnd = parseLocalDateTime(slot.endAt);
  const startDate = formatDateStr(globalStart);
  const endDate = formatDateStr(globalEnd);

  if (startDate === endDate) {
    return buildDateTimeRange(dateStr, startMinute, endMinute);
  }

  let newStart = new Date(globalStart);
  let newEnd = new Date(globalEnd);
  const [y, m, d] = dateStr.split('-').map(Number);
  const day = new Date(y, m - 1, d);
  const originalClip = clipIntervalToDay(globalStart, globalEnd, day);
  if (!originalClip) {
    return { start: globalStart, end: globalEnd };
  }

  if (dateStr === startDate) {
    newStart = buildDateTimeRange(dateStr, startMinute, endMinute).start;
    if (endMinute < originalClip.endMinute) {
      newEnd = buildDateTimeRange(dateStr, startMinute, endMinute).end;
    }
  } else if (dateStr === endDate) {
    newEnd = buildDateTimeRange(dateStr, startMinute, endMinute).end;
    if (startMinute > originalClip.startMinute) {
      newStart = buildDateTimeRange(dateStr, startMinute, endMinute).start;
    }
  } else {
    if (startMinute > originalClip.startMinute) {
      newStart = buildDateTimeRange(dateStr, startMinute, endMinute).start;
    }
    if (endMinute < originalClip.endMinute) {
      newEnd = buildDateTimeRange(dateStr, startMinute, endMinute).end;
    }
  }

  return { start: newStart, end: newEnd };
};

export const validateAvailabilityRange = (
  start: Date,
  end: Date,
  hiredByDay: Record<string, ApplicantSchedule[]>,
  availability: WorkerAvailabilityResponse[],
  excludeId?: number,
): string | null => {
  if (end.getTime() <= start.getTime()) {
    return '종료 시간은 시작 시간보다 이후여야 합니다.';
  }
  if (start.getTime() < Date.now()) {
    return '과거 시간에는 가용시간을 등록할 수 없습니다.';
  }

  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);
  const lastDay = new Date(end);
  lastDay.setHours(0, 0, 0, 0);

  while (cursor.getTime() <= lastDay.getTime()) {
    const day = new Date(cursor);
    const dateStr = formatDateStr(day);
    const clipped = clipIntervalToDay(start, end, day);
    if (clipped) {
      const { startMinute, endMinute } = clipped;
      if (endMinute - startMinute < 15) {
        return '가용시간은 최소 15분 이상이어야 합니다.';
      }
      if (overlapsHiredOnDay(dateStr, startMinute, endMinute, hiredByDay)) {
        return '채용 확정된 근무 시간과 겹칩니다.';
      }
      if (overlapsAvailabilityOnDay(day, startMinute, endMinute, availability, excludeId)) {
        return '이미 등록된 가용시간과 겹칩니다.';
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return null;
};

/** 해당 요일 그리드에서 현재 시각까지 지난 구간(분) — 오늘만, 미래 요일은 0 */
export const getPastMinutesForDay = (dateStr: string, now: Date = new Date()) => {
  if (dateStr !== formatDateStr(now)) return 0;
  return now.getHours() * 60 + now.getMinutes();
};

/** 지난 구간 오버레이 높이(px) — minHour 기준, 그리드 범위 내로 클램프 */
export const getPastOverlayHeight = (
  dateStr: string,
  minHour: number,
  maxHour: number,
  hourHeight: number,
  now: Date = new Date(),
) => {
  const pastMinutes = getPastMinutesForDay(dateStr, now);
  const gridStartMinute = minHour * 60;
  const gridEndMinute = maxHour * 60;
  const clampedPast = Math.max(gridStartMinute, Math.min(pastMinutes, gridEndMinute));
  if (clampedPast <= gridStartMinute) return 0;
  return ((clampedPast - gridStartMinute) / 60) * hourHeight;
};

/** 해당 요일 전체가 과거인지 (오늘 이전) */
export const isDayFullyPast = (dateStr: string, now: Date = new Date()) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dayEnd = new Date(y, m - 1, d, 23, 59, 59, 999);
  return dayEnd.getTime() < now.getTime();
};

/** 드래그/리사이즈 시 사용할 최소 분(과거 경계) */
export const getMinEditableMinuteForDay = (dateStr: string, now: Date = new Date()) => {
  if (isDayFullyPast(dateStr, now)) return 24 * 60;
  return getPastMinutesForDay(dateStr, now);
};

/** 드래그/리사이즈 분 값을 15분 스냅 + 과거 경계 이상으로 클램프 */
export const clampEditableMinuteForDay = (
  dateStr: string,
  minute: number,
  now: Date = new Date(),
) => {
  const minEditable = getMinEditableMinuteForDay(dateStr, now);
  const snapped = snapMinutes(minute);
  return Math.max(minEditable, Math.min(24 * 60, snapped));
};
