import styled from 'styled-components';
import type { Schedule } from '../model/types/schedule.type';
import { useScheduleStore } from '../model/store/scheduleStore';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import Badge from 'shared/ui/Badge/Badge';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  schedule: Schedule;
  onSelect?: () => void; // 셀렉트 후 추가 동작 (예: 달 이동)
}

export const ScheduleChip = ({ schedule, onSelect }: Props) => {
  const { jobPostId, title, filledSlots, totalSlots, postStatus } = schedule;
  const isClosed = postStatus === 'CLOSED';

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
      <S.BadgeRow>
        <Badge scheme={isClosed ? 'warning' : 'primary'}>
          {isClosed ? '모집완료' : '모집중'}
        </Badge>
      </S.BadgeRow>
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

    /* 뱃지 크기 축소 */
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
