import { hoverOverlay } from 'shared/styles/hoverOverlay';
import styled from 'styled-components';

export const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.color.border};
  ${hoverOverlay}
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const BadgeGroup = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;

  span {
    padding: 3px 10px;
  }
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
  color: #bbbbbb;
  font-size: 18px;
`;

export const TitleSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const Title = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.35;
`;

export const DDay = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #000000;
  flex-shrink: 0;
  margin-left: 8px;
`;

export const Company = styled.p`
  font-size: 13px;
  color: #666666;
  margin: -4px 0 0 0;
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 14px;
  margin-top: 4px;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #333333;
  min-width: 0;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-weight: 700;
  }
`;

export const Icon = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  opacity: 0.6;

  svg {
    width: 15px;
    height: 15px;
  }
`;

export const ProgressSection = styled.div`
  margin-top: 4px;
`;

export const BottomActions = styled.div`
  display: flex;
  gap: 8px;
  padding-top: 8px;
  margin-top: 2px;

  & > button {
    flex: 1;
    padding-top: 10px;
    padding-bottom: 10px;
  }
`;