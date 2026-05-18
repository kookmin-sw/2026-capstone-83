import styled, { css } from 'styled-components';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

/** 고용주·구직자 캘린더 위젯 공통 래퍼 */
export const CalendarSurface = styled.div`
  padding: 32px;
  background-color: ${({ theme }) => theme.color.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadow.default};
  min-width: 0;

  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    padding: 24px;
  }

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    padding: 16px;
  }

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    padding: 12px;
  }
`;

export const calendarHeaderCss = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

// ===== 캘린더 공통 헤더 =====
export const CalendarHeader = styled.div`
  ${calendarHeaderCss}
`;

export const NavRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

export const CalendarTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSize.large};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  white-space: nowrap;

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    font-size: ${({ theme }) => theme.fontSize.medium};
  }
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
  flex-shrink: 0;
  &:hover { background-color: ${({ theme }) => theme.color.background}; }
`;

// ===== 주간 캘린더 공통 =====
export const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  min-width: 0;

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding-bottom: 8px;
    -webkit-overflow-scrolling: touch;
  }

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    flex-direction: column;
    overflow-x: visible;
    gap: 16px;
  }
`;

export const DayColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    flex: 0 0 132px;
    min-width: 132px;
  }

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    flex: 1 1 auto;
    min-width: 0;
    width: 100%;
  }
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

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    text-align: left;
    padding: 8px 12px;

    .date {
      font-size: ${({ theme }) => theme.fontSize.medium};
    }
  }
`;

export const DayContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 200px;

  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    min-height: 160px;
  }

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    min-height: 120px;
  }

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    min-height: 0;
  }
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
  min-width: 0;

  ${hoverOverlay}

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    padding: 10px;
    gap: 4px;
  }
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    font-size: ${({ theme }) => theme.fontSize.xsmall};
  }
`;

export const CardMeta = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.subText};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProgressRow = styled.div`
  display: flex;
  gap: 12px;
  font-size: 10px;
  .confirmed { color: ${({ theme }) => theme.color.primary}; font-weight: bold; }
  .total { color: ${({ theme }) => theme.color.subText}; }

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    display: none;
  }
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
