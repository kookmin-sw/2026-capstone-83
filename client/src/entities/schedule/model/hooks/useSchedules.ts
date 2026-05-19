import { useQuery } from '@tanstack/react-query';
import { fetchSchedules, fetchMockSchedules } from '../../api/schedule.api';
import { filterSchedulesByWorkplace } from '../../lib/filterSchedulesByWorkplace';
import type { ScheduleResponse } from '../types/schedule.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 고용주 캘린더 일정 조회
 * - API: 월 단위 전체 작업장 1회 (queryKey에 workplaceId 없음)
 * - workplaceId: React Query select로 클라이언트 필터 (탭 전환 시 재요청 없음)
 */
export const useSchedules = (workplaceId: number | null, fromDate: string, toDate: string) => {
  return useQuery<ScheduleResponse>({
    queryKey: ['schedules', fromDate, toDate],
    queryFn: async () => {
      const real = await fetchSchedules({ fromDate, toDate }).catch(() => null);

      if (USE_MOCK) {
        const mock = await fetchMockSchedules();

        if (!real) return mock;

        // 두 응답의 schedules(날짜별 배열)를 병합
        const mergedSchedules = { ...mock.schedules };
        for (const [date, items] of Object.entries(real.schedules)) {
          mergedSchedules[date] = [...(mergedSchedules[date] || []), ...items];
        }

        return {
          startDate: real.startDate || mock.startDate,
          endDate: real.endDate || mock.endDate,
          schedules: mergedSchedules,
        };
      }

      if (!real) throw new Error('Failed to fetch schedules');
      return real;
    },
    select: (data) => ({
      ...data,
      schedules: filterSchedulesByWorkplace(data.schedules, workplaceId),
    }),
    enabled: Boolean(fromDate && toDate),
    staleTime: 1000 * 60 * 5,
  });
};
