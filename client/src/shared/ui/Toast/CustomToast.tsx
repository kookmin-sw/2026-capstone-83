import styled, { useTheme } from 'styled-components';
import { UserPlus, CheckCircle, Pencil, Info, Trash2, Sparkles } from 'lucide-react';
import toast, { type Toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { getNotificationNavigatePath } from 'entities/notification/lib/getNotificationNavigatePath';
import { useNotificationStore } from 'entities/notification/model/store/notificationStore';
import type { Notification, NotificationType } from 'entities/notification/model/types/notification.type';

interface Props {
  t: Toast;
  notification: Notification;
}

const ICON_MAP: Record<NotificationType, typeof UserPlus> = {
  NEW_APPLICATION: UserPlus,
  OFFER_RECEIVED: Info,
  OFFER_ACCEPTED: CheckCircle,
  HIRED: CheckCircle,
  REJECTED: Info,
  WORK_COMPLETED: Pencil,
  JOB_POST_DELETED: Trash2,
  AUTO_MATCHED: Sparkles,
};

export const CustomToast = ({ t, notification }: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const markAsRead = useNotificationStore((s) => s.markAsRead);
  const { type, message } = notification;
  const Icon = ICON_MAP[type];
  const isHighlight =
    type === 'NEW_APPLICATION' ||
    type === 'OFFER_ACCEPTED' ||
    type === 'HIRED' ||
    type === 'AUTO_MATCHED';
  const iconColor = isHighlight ? theme.color.primary : theme.color.subText;

  const handleClick = () => {
    markAsRead(notification.id);
    navigate(getNotificationNavigatePath(notification.type, role));
    toast.dismiss(t.id);
  };

  return (
    <S.Wrapper
      $visible={t.visible}
      $isHighlight={isHighlight}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <S.IconCircle $isHighlight={isHighlight}>
        <Icon size={18} color={iconColor} />
      </S.IconCircle>
      <S.Message>{message}</S.Message>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div<{ $visible: boolean; $isHighlight: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    max-width: 380px;
    background-color: ${({ theme, $isHighlight }) =>
      $isHighlight ? theme.color.secondary : theme.color.background};
    border: 1px solid ${({ theme, $isHighlight }) =>
      $isHighlight ? theme.color.primary : theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
    cursor: pointer;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transform: translateX(${({ $visible }) => ($visible ? '0' : '100%')});
    transition: all 0.3s ease;
  `,
  IconCircle: styled.div<{ $isHighlight: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: ${({ theme, $isHighlight }) =>
      $isHighlight ? theme.color.white : theme.color.subBackground};
    flex-shrink: 0;
  `,
  Message: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    line-height: 1.4;
  `,
};
