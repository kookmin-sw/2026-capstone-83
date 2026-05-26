import { hoverOverlay } from 'shared/styles/hoverOverlay';
import styled, { css } from 'styled-components';
import type { DDayTone } from '../lib/jobPostCardDisplay';

export const CardOuter = styled.div`
  background: ${({ theme }) => theme.color.white};
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  border: 1px solid ${({ theme }) => theme.color.border};
  overflow: visible;
  display: flex;
  flex-direction: column;
`;

export const CardContainer = styled.article`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  ${hoverOverlay}
`;

export const CardFooter = styled.div`
  border-top: 1px solid ${({ theme }) => theme.color.border};
`;

export const TopRow = styled.div<{ $withLogo?: boolean }>`
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

export const LogoBox = styled.div`
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.color.border};
  background: ${({ theme }) => theme.color.background};
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const LogoFallback = styled.span`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.color.primary};
`;

export const MainColumn = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const Company = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  font-weight: ${({ theme }) => theme.fontWeight.medium};
  color: ${({ theme }) => theme.color.subText};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  flex-shrink: 0;
  align-self: center;
  white-space: nowrap;
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`;

export const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const Title = styled.h3`
  flex: 0 1 auto;
  min-width: 0;
  max-width: 100%;
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  color: ${({ theme }) => theme.color.text};
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const dDayToneStyles: Record<DDayTone, ReturnType<typeof css>> = {
  default: css`
    color: ${({ theme }) => theme.color.primary};
    background: ${({ theme }) => theme.color.secondary};
  `,
  urgent: css`
    color: ${({ theme }) => theme.color.error};
    background: #fee2e2;
  `,
  today: css`
    color: ${({ theme }) => theme.color.white};
    background: ${({ theme }) => theme.color.highlight};
  `,
  closed: css`
    color: ${({ theme }) => theme.color.subText};
    background: ${({ theme }) => theme.color.subBackground};
  `,
};

export const DDayChip = styled.span<{ $tone: DDayTone }>`
  flex-shrink: 0;
  padding: 4px 10px;
  border-radius: ${({ theme }) => theme.borderRadius.round};
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  font-weight: ${({ theme }) => theme.fontWeight.bold};
  line-height: 1.2;
  ${({ $tone }) => dDayToneStyles[$tone]}
`;

export const PayLine = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.color.text};
  line-height: 1.5;

  strong {
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.tertiary};
  }

  .dot {
    margin: 0 6px;
    color: ${({ theme }) => theme.color.border};
  }
`;

export const LocationLine = styled.p`
  margin: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.thirdText};
  min-width: 0;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`;

export const Icon = styled.span`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  color: ${({ theme }) => theme.color.subText};

  svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
  }
`;

export const FooterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

export const ProgressWrap = styled.div`
  flex: 1;
  min-width: 120px;
`;

export const SlotsHint = styled.span`
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.subText};
  white-space: nowrap;
`;

export const BadgeGroup = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;

  span {
    padding: 3px 8px;
  }
`;

