import styled from 'styled-components';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

type ViewMode = 'monthly' | 'weekly';

interface Props {
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
}

export const ViewToggle = ({ viewMode, onViewChange }: Props) => {
  return (
    <S.Toggle>
      <S.Button $active={viewMode === 'monthly'} onClick={() => onViewChange('monthly')}>
        월간
      </S.Button>
      <S.Button $active={viewMode === 'weekly'} onClick={() => onViewChange('weekly')}>
        주간
      </S.Button>
    </S.Toggle>
  );
};

const S = {
  Toggle: styled.div`
    display: flex;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.round};
    overflow: hidden;
    width: fit-content;
  `,
  Button: styled.button<{ $active: boolean }>`
    padding: 8px 20px;
    border: none;
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme, $active }) =>
      $active ? theme.fontWeight.semibold : theme.fontWeight.regular};
    background-color: ${({ theme, $active }) =>
      $active ? theme.color.primary : 'transparent'};
    color: ${({ theme, $active }) =>
      $active ? theme.color.white : theme.color.text};
    cursor: pointer;
    transition: all 0.15s ease;

    ${hoverOverlay}
  `,
};
