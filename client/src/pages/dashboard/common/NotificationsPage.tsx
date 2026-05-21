import styled from 'styled-components';
import { useNotificationNavigate } from 'entities/notification/model/hooks/useNotificationNavigate';
import { useNotificationStore } from 'entities/notification/model/store/notificationStore';
import { NotificationItem } from 'entities/notification/ui/NotificationItem';
import Empty from 'shared/ui/Empty/Empty';

const NotificationsPage = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const { handleNotificationClick } = useNotificationNavigate();

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
              onClick={() => handleNotificationClick(noti)}
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
