import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { issueSseToken } from '../api/notification.api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * SSE를 통한 실시간 알림 구독 훅
 * 새 알림이 도착하면 관련 쿼리를 자동으로 갱신합니다.
 */
export const useNotificationSSE = () => {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const connect = async () => {
      try {
        const sseToken = await issueSseToken();
        if (isCancelled) return;

        const url = `${BASE_URL}/api/v1/notifications/subscribe?token=${sseToken}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('notification', () => {
          // 새 알림 도착 시 관련 쿼리 갱신
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        eventSource.onerror = () => {
          eventSource.close();
          // 연결 끊기면 5초 후 재연결 시도
          if (!isCancelled) {
            setTimeout(connect, 5000);
          }
        };
      } catch {
        // 토큰 발급 실패 시 5초 후 재시도
        if (!isCancelled) {
          setTimeout(connect, 5000);
        }
      }
    };

    connect();

    return () => {
      isCancelled = true;
      eventSourceRef.current?.close();
    };
  }, [queryClient]);
};
