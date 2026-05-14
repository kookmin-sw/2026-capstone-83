import type { ReactNode } from 'react';
import styled from 'styled-components';
import type { Schedule } from '../model/types/schedule.type';
import { useScheduleStore } from '../model/store/scheduleStore';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  schedule: Schedule;
  badge: ReactNode;
  onSelect?: () => void;
}

export const ScheduleChip = ({ schedule, badge, onSelect }: Props) => {
  const { jobPostId, filledSlots, totalSlots, title } = schedule;

  const selectedId = useScheduleStore((s) => s.selectedJobPostId);
  const setSelectedId = useScheduleStore((s) => s.setSelectedJobPostId);
  const isSelected = selectedId === jobPostId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedId(isSelected ? null : jobPostId);
    if (!isSelected && onSelect) {
      onSelect();
    }
  };

  return (
    <S.Chip $selected={isSelected} onClick={handleClick}>
      {badge && <S.BadgeRow>{badge}</S.BadgeRow>}
      <S.Title>{title}</S.Title>
      <ProgressBar total={totalSlots} current={filledSlots} height="6px" fontSize="11px" />
    </S.Chip>
  );
};

const S = {
  Chip: styled.div<{ $selected: boolean }>`
    padding: 8px 10px;
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.color.secondary : theme.color.background};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    border: ${({ theme, $selected }) =>
      $selected ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`};
    display: flex;
    flex-direction: column;
    gap: 4px;
    cursor: pointer;
    transition: all 0.15s ease;
    position: relative;
    z-index: 2;

    ${hoverOverlay}
  `,
  BadgeRow: styled.div`
    display: flex;
    & > span {
      font-size: 9px;
      padding: 2px 6px;
    }
  `,
  Title: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    color: ${({ theme }) => theme.color.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
};
