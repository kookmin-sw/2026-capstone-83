import { useEffect, useRef } from 'react';
import { issueSseToken, fetchNotifications } from '../../api/notification.api';
import { useNotificationStore } from '../store/notificationStore';
import { showNotificationToast } from 'features/notification/showNotificationToast';
import type { Notification } from '../types/notification.type';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * SSE를 통한 실시간 알림 구독 훅
 * - 연결 시 알림 목록 초기 로드
 * - 새 알림 도착 시 store 갱신 + 토스트 표시
 * @param enabled - true일 때만 SSE 연결 (로그인 상태)
 */
export const useNotificationSSE = (enabled: boolean = true) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const prevIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    let isCancelled = false;

    const loadNotifications = async () => {
      const real = await fetchNotifications().catch(() => []);
      setNotifications(real);
      prevIdsRef.current = new Set(real.map((n) => n.id));
    };

    const connect = async () => {
      // 초기 로드
      await loadNotifications();

      try {
        const sseToken = await issueSseToken();
        if (isCancelled) return;

        const url = `${BASE_URL}/api/v1/notifications/subscribe?token=${sseToken}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('notification', async () => {
          // 새 알림 도착 → 목록 다시 조회
          const real = await fetchNotifications().catch(() => []);

          // 새로 추가된 알림 찾기 → 토스트 표시
          const newNotifications = real.filter((n) => !prevIdsRef.current.has(n.id));
          newNotifications.forEach((n: Notification) => {
            showNotificationToast(n);
          });

          prevIdsRef.current = new Set(real.map((n) => n.id));
          setNotifications(real);
        });

        eventSource.onerror = () => {
          eventSource.close();
          if (!isCancelled) {
            setTimeout(connect, 5000);
          }
        };
      } catch {
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
  }, [enabled, setNotifications]);
};
