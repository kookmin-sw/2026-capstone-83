import { useEffect } from 'react';
import styled from 'styled-components';
import { useNotificationStore } from 'entities/notification/model/store/notificationStore';
import { fetchMockNotifications } from 'entities/notification/api/notification.api';
import { NotificationItem } from 'entities/notification/ui/NotificationItem';
import Empty from 'shared/ui/Empty/Empty';

const NotificationsPage = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const markAsRead = useNotificationStore((s) => s.markAsRead);

  useEffect(() => {
    if (notifications.length === 0) {
      fetchMockNotifications().then(setNotifications);
    }
  }, [notifications.length, setNotifications]);

  return (
    <S.PageWrapper>
      <S.Header>
        <S.Title>전체 알림</S.Title>
        <S.MarkAllButton onClick={markAllAsRead}>모두 읽음</S.MarkAllButton>
      </S.Header>

      <S.ListCard>
        {notifications.length > 0 ? (
          notifications.map((noti) => (
            <NotificationItem
              key={noti.id}
              data={noti}
              onClick={() => markAsRead(noti.id)}
            />
          ))
        ) : (
          <Empty message="알림이 없습니다." />
        )}
      </S.ListCard>
    </S.PageWrapper>
  );
};

const S = {
  PageWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
  `,
  Title: styled.h1`
    font-size: ${({ theme }) => theme.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    margin: 0;
  `,
  MarkAllButton: styled.button`
    background: none;
    border: none;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.primary};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  `,
  ListCard: styled.div`
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
    overflow: hidden;
  `,
};

export default NotificationsPage;
