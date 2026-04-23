import { hoverOverlay } from 'shared/styles/hoverOverlay';
import styled from 'styled-components';

export const CardContainer = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  gap: 6px;
`;

export const ActionGroup = styled.div`
  display: flex;
  gap: 12px;
  color: #bbbbbb;
  font-size: 20px;
`;

export const TitleSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

export const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.4;
`;

export const DDay = styled.span`
  font-size: 24px;
  font-weight: 800;
  color: #000000;
`;

export const Company = styled.p`
  font-size: 14px;
  color: #666666;
  margin: -8px 0 0 0;
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 20px;
  margin-top: 8px;
`;

export const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  color: #333333;

  strong {
    font-weight: 700;
  }
`;

export const Icon = styled.span`
  font-size: 16px;
  opacity: 0.6;
`;

export const ProgressSection = styled.div`
  margin-top: 10px;
`;