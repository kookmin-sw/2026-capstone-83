import type { ReactNode } from 'react';
import styled from 'styled-components';
import type { Schedule } from '../model/types/schedule.type';
import { useScheduleStore } from '../model/store/scheduleStore';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

export type ScheduleChipDensity = 'full' | 'compact';

interface Props {
  schedule: Schedule;
  badge: ReactNode;
  onSelect?: () => void;
  /** 모달 등에서는 full, 월간 셀은 미지정 시 CSS로 compact 적용 */
  density?: ScheduleChipDensity;
}

export const ScheduleChip = ({ schedule, badge, onSelect, density = 'full' }: Props) => {
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
    <S.Chip $selected={isSelected} $density={density} onClick={handleClick}>
      {badge && <S.BadgeRow $density={density}>{badge}</S.BadgeRow>}
      <S.Title>{title}</S.Title>
      <S.ProgressWrap $density={density}>
        <ProgressBar total={totalSlots} current={filledSlots} height="6px" fontSize="11px" />
      </S.ProgressWrap>
    </S.Chip>
  );
};

const S = {
  Chip: styled.div<{ $selected: boolean; $density: ScheduleChipDensity }>`
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
    min-width: 0;

    ${hoverOverlay}

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      padding: 7px 8px;
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      padding: 6px;
      gap: 2px;
    }
  `,
  BadgeRow: styled.div<{ $density: ScheduleChipDensity }>`
    display: flex;

    & > span {
      font-size: 9px;
      padding: 2px 6px;
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      display: ${({ $density }) => ($density === 'full' ? 'flex' : 'none')};
    }
  `,
  Title: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    color: ${({ theme }) => theme.color.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      font-size: 10px;
    }
  `,
  ProgressWrap: styled.div<{ $density: ScheduleChipDensity }>`
    display: block;

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      display: ${({ $density }) => ($density === 'full' ? 'block' : 'none')};
    }
  `,
};
