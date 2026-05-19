import type { Schedule } from '../model/types/schedule.type';

/** 고용주 캘린더: 작업장 탭 기준 클라이언트 필터 (null = 전체) */
export function filterSchedulesByWorkplace(
  schedules: Record<string, Schedule[]>,
  workplaceId: number | null,
): Record<string, Schedule[]> {
  if (workplaceId == null) return schedules;

  const filtered: Record<string, Schedule[]> = {};
  for (const [date, items] of Object.entries(schedules)) {
    const matched = items.filter((item) => item.workplaceId === workplaceId);
    if (matched.length > 0) {
      filtered[date] = matched;
    }
  }
  return filtered;
}
