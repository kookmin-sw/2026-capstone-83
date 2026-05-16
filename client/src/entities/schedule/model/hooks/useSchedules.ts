import { useQuery } from '@tanstack/react-query';
import { fetchSchedules, fetchMockSchedules } from '../../api/schedule.api';
import type { ScheduleResponse } from '../types/schedule.type';
import { USE_MOCK } from 'shared/config/env';

/**
 * 캘린더 일정 조회 훅
 * - mock 모드: mock 데이터 + 실제 API 응답 병합 (schedules 합침)
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useSchedules = (workplaceId: number | null, fromDate: string, toDate: string) => {
  return useQuery<ScheduleResponse>({
    queryKey: ['schedules', workplaceId, fromDate, toDate],
    queryFn: async () => {
      if (!workplaceId) throw new Error('workplaceId is required');

      const real = await fetchSchedules(workplaceId, { fromDate, toDate }).catch(() => null);

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
    enabled: workplaceId !== null,
  });
};
