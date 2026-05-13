import styled from 'styled-components';
import { Clock } from 'lucide-react';
import type { Schedule } from '../model/types/schedule.type';
import { useScheduleStore } from '../model/store/scheduleStore';
import Badge from 'shared/ui/Badge/Badge';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  schedule: Schedule;
}

export const WeeklyScheduleCard = ({ schedule }: Props) => {
  const { jobPostId, title, workStart, workEnd, filledSlots, totalSlots, postStatus } = schedule;
  const isClosed = postStatus === 'CLOSED';

  const selectedId = useScheduleStore((s) => s.selectedJobPostId);
  const setSelectedId = useScheduleStore((s) => s.setSelectedJobPostId);
  const isSelected = selectedId === jobPostId;

  const handleClick = () => {
    setSelectedId(isSelected ? null : jobPostId);
  };

  return (
    <S.Card $selected={isSelected} onClick={handleClick}>
      <S.BadgeRow>
        <Badge scheme={isClosed ? 'warning' : 'primary'}>
          {isClosed ? '모집 완료' : '모집 중'}
        </Badge>
      </S.BadgeRow>
      <S.Title>{title}</S.Title>
      <S.Meta><Clock size={12} /> {workStart} - {workEnd}</S.Meta>
      <S.ProgressRow>
        <span className="confirmed">확정 {filledSlots}</span>
        <span className="total">모집 {totalSlots}</span>
      </S.ProgressRow>
      <ProgressBar total={totalSlots} current={filledSlots} height="6px" fontSize="10px" />
    </S.Card>
  );
};

const S = {
  Card: styled.div<{ $selected: boolean }>`
    padding: 12px;
    background-color: ${({ theme, $selected }) =>
      $selected ? theme.color.secondary : theme.color.white};
    border: ${({ theme, $selected }) =>
      $selected ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    display: flex;
    flex-direction: column;
    gap: 6px;
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
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  `,
  Meta: styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  ProgressRow: styled.div`
    display: flex;
    gap: 12px;
    font-size: 10px;
    .confirmed { color: ${({ theme }) => theme.color.primary}; font-weight: bold; }
    .total { color: ${({ theme }) => theme.color.subText}; }
  `,
};
