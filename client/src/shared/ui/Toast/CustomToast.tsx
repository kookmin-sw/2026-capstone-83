import styled, { useTheme } from 'styled-components';
import { UserPlus, CheckCircle, Pencil, Info } from 'lucide-react';
import toast, { type Toast } from 'react-hot-toast';
import type { NotificationType } from 'entities/notification/model/types/notification.type';

interface Props {
  t: Toast;
  message: string;
  type: NotificationType;
}

const ICON_MAP: Record<NotificationType, typeof UserPlus> = {
  APPLY: UserPlus,
  ACCEPT: CheckCircle,
  WORK_COMPLETE: Pencil,
  SYSTEM: Info,
};

export const CustomToast = ({ t, message, type }: Props) => {
  const theme = useTheme();
  const Icon = ICON_MAP[type];
  const isSystem = type === 'SYSTEM';
  const iconColor = isSystem ? theme.color.subText : theme.color.primary;

  return (
    <S.Wrapper
      $visible={t.visible}
      $isSystem={isSystem}
      onClick={() => toast.dismiss(t.id)}
    >
      <S.IconCircle $isSystem={isSystem}>
        <Icon size={18} color={iconColor} />
      </S.IconCircle>
      <S.Message>{message}</S.Message>
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div<{ $visible: boolean; $isSystem: boolean }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    max-width: 380px;
    background-color: ${({ theme, $isSystem }) =>
      $isSystem ? theme.color.background : theme.color.secondary};
    border: 1px solid ${({ theme, $isSystem }) =>
      $isSystem ? theme.color.border : theme.color.primary};
    /* border-left: 4px solid ${({ theme, $isSystem }) =>
      $isSystem ? theme.color.subText : theme.color.primary}; */
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
    cursor: pointer;
    opacity: ${({ $visible }) => ($visible ? 1 : 0)};
    transform: translateX(${({ $visible }) => ($visible ? '0' : '100%')});
    transition: all 0.3s ease;
  `,
  IconCircle: styled.div<{ $isSystem: boolean }>`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background-color: ${({ theme, $isSystem }) =>
      $isSystem ? theme.color.subBackground : theme.color.white};
    flex-shrink: 0;
  `,
  Message: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    line-height: 1.4;
  `,
};
