import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useNotificationNavigate } from 'entities/notification/model/hooks/useNotificationNavigate';
import { useNotificationStore } from 'entities/notification/model/store/notificationStore';
import { NotificationItem } from 'entities/notification/ui/NotificationItem';

interface Props {
  onClose: () => void;
}

export const NotificationDropdown = ({ onClose }: Props) => {
  const navigate = useNavigate();
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead);
  const { handleNotificationClick } = useNotificationNavigate();

  const recentNotifications = notifications.slice(0, 5);

  return (
    <S.Dropdown>
      <S.Header>
        <S.Title>알림</S.Title>
        <S.MarkAllButton onClick={markAllAsRead}>모두 읽음</S.MarkAllButton>
      </S.Header>

      <S.List>
        {recentNotifications.length > 0 ? (
          recentNotifications.map((noti) => (
            <NotificationItem
              key={noti.id}
              data={noti}
              onClick={() => handleNotificationClick(noti, { onAfterNavigate: onClose })}
            />
          ))
        ) : (
          <S.EmptyText>새로운 알림이 없습니다.</S.EmptyText>
        )}
      </S.List>

      <S.Footer>
        <S.ViewAllButton onClick={() => { navigate('/dashboard/notifications'); onClose(); }}>
          전체 알림 보기
        </S.ViewAllButton>
      </S.Footer>
    </S.Dropdown>
  );
};

const S = {
  Dropdown: styled.div`
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    width: 380px;
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.large};
    box-shadow: ${({ theme }) => theme.shadow.default};
    border: 1px solid ${({ theme }) => theme.color.border};
    z-index: 100;
    overflow: hidden;
  `,
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid ${({ theme }) => theme.color.border};
  `,
  Title: styled.h3`
    font-size: ${({ theme }) => theme.fontSize.medium};
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
  List: styled.div`
    max-height: 400px;
    overflow-y: auto;
  `,
  EmptyText: styled.p`
    padding: 40px 20px;
    text-align: center;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
  Footer: styled.div`
    border-top: 1px solid ${({ theme }) => theme.color.border};
    padding: 12px 20px;
    text-align: center;
  `,
  ViewAllButton: styled.button`
    background: none;
    border: none;
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    cursor: pointer;

    &:hover {
      color: ${({ theme }) => theme.color.primary};
    }
  `,
};
