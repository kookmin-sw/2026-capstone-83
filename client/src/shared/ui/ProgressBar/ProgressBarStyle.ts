import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
`;

export const BarContainer = styled.div`
  flex: 1;
  height: 12px;
  background-color: ${({ theme }) => theme.color.subBackground};
  border-radius: 10px;
  overflow: hidden;
`;

export const Filler = styled.div<{ $width: number }>`
  width: ${({ $width }) => $width}%;
  height: 100%;
  background-color: ${({ theme }) => theme.color.primary}; 
  border-radius: 10px;
  transition: width 0.5s ease-out; // 바가 스르륵 차오르는 효과
`;

export const Label = styled.div`
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;

  .current {
    color: ${({ theme }) => theme.color.primary}; 
  }
  .divider {
    color: ${({ theme }) => theme.color.text}; 
    margin: 0 2px;
  }
  .total {
    color: ${({ theme }) => theme.color.subText}; 
  }
`;