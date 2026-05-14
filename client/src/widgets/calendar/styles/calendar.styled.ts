import styled from 'styled-components';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

// ===== 캘린더 공통 헤더 =====
export const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

export const NavRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const CalendarTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
`;

export const NavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${({ theme }) => theme.color.text};
  padding: 4px;
  border-radius: 50%;
  &:hover { background-color: ${({ theme }) => theme.color.background}; }
`;

// ===== 주간 캘린더 공통 =====
export const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
`;

export const DayColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DayHeader = styled.div<{ $isSaturday: boolean; $isSunday: boolean; $isToday?: boolean }>`
  text-align: center;
  padding: 8px 0;
  background-color: ${({ theme }) => theme.color.background};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  .label {
    display: block;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme, $isSaturday, $isSunday, $isToday }) =>
    $isToday ? theme.color.primary
      : $isSunday ? theme.color.error
        : $isSaturday ? theme.color.primary
          : theme.color.subText};
  }
  .date {
    display: block;
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme, $isSaturday, $isSunday, $isToday }) =>
    $isToday ? theme.color.primary
      : $isSunday ? theme.color.error
        : $isSaturday ? theme.color.primary
          : theme.color.text};
  }
`;

export const DayContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;
`;

// ===== 카드/칩 공통 =====
export const ScheduleCardBase = styled.div<{ $selected: boolean }>`
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
`;

export const BadgeRow = styled.div`
  display: flex;
  & > span {
    font-size: 9px;
    padding: 2px 6px;
  }
`;

export const CardTitle = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

export const CardMeta = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.subText};
`;

export const ProgressRow = styled.div`
  display: flex;
  gap: 12px;
  font-size: 10px;
  .confirmed { color: ${({ theme }) => theme.color.primary}; font-weight: bold; }
  .total { color: ${({ theme }) => theme.color.subText}; }
`;

// ===== 추가 버튼 =====
export const AddButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 16px 8px;
  border: 2px dashed ${({ theme }) => theme.color.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: transparent;
  color: ${({ theme }) => theme.color.subText};
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
  z-index: 2;

  ${hoverOverlay}

  &:hover {
    border-color: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.primary};
  }
`;
