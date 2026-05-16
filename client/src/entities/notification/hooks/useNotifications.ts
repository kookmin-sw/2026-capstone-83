import { useQuery } from '@tanstack/react-query';
import { fetchMockNotifications } from '../api/notification.mock.api';
import { fetchNotifications as fetchRealNotifications } from '../api/notification.api';
import type { Notification } from '../model/types/notification.type';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

/**
 * 알림 목록 조회 훅
 * - mock 모드: mock 데이터 + 실제 API 응답 병합
 * - 실제 모드: 실제 API 응답만 반환
 */
export const useNotifications = () => {
  return useQuery<Notification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const real = await fetchRealNotifications().catch(() => []);

      if (USE_MOCK) {
        const mock = await fetchMockNotifications();
        return [...mock, ...real];
      }

      return real;
    },
  });
};
