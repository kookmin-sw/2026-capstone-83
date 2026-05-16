import styled from 'styled-components';
import { UserPlus, CheckCircle, Pencil, Info } from 'lucide-react';
import { useTheme } from 'styled-components';
import type { Notification, NotificationType } from '../model/types/notification.type';

interface Props {
  data: Notification;
  onClick?: () => void;
}

const ICON_MAP: Record<NotificationType, typeof UserPlus> = {
  NEW_APPLICATION: UserPlus,
  OFFER_RECEIVED: Info,
  OFFER_ACCEPTED: CheckCircle,
  HIRED: CheckCircle,
  REJECTED: Info,
  WORK_COMPLETED: Pencil,
};

const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;
  if (diffDay === 1) return '어제';
  return `${diffDay}일 전`;
};

export const NotificationItem = ({ data, onClick }: Props) => {
  const theme = useTheme();
  const { type, message, createdAt, isRead } = data;
  const IconComponent = ICON_MAP[type];

  const isHighlight = type === 'NEW_APPLICATION' || type === 'OFFER_ACCEPTED' || type === 'HIRED';

  const iconBgColor = isHighlight
    ? theme.color.secondary
    : theme.color.background;

  const iconColor = isHighlight
    ? theme.color.primary
    : theme.color.subText;

  return (
    <S.Item $isRead={isRead} onClick={onClick}>
      <S.IconCircle $bgColor={iconBgColor}>
        <IconComponent size={18} color={iconColor} />
      </S.IconCircle>

      <S.Content>
        <S.Message>{message}</S.Message>
        <S.Time>{formatTimeAgo(createdAt)}</S.Time>
      </S.Content>

      {!isRead && <S.UnreadDot />}
    </S.Item>
  );
};

const S = {
  Item: styled.div<{ $isRead: boolean }>`
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 20px;
    background-color: ${({ theme, $isRead }) =>
      $isRead ? 'transparent' : theme.color.secondary};
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: ${({ theme }) => theme.color.background};
    }
  `,
  IconCircle: styled.div<{ $bgColor: string }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: ${({ $bgColor }) => $bgColor};
    flex-shrink: 0;
  `,
  Content: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  `,
  Message: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    line-height: 1.5;
  `,
  Time: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  UnreadDot: styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.color.primary};
    flex-shrink: 0;
    margin-top: 6px;
  `,
};
