import type { ReactNode } from 'react';
import styled from 'styled-components';

interface Props {
  children: ReactNode;
}

const StickyBar = ({ children }: Props) => {
  return (
    <StickyBarWrapper>
      <StickyBarInner>{children}</StickyBarInner>
    </StickyBarWrapper>
  );
};

const StickyBarWrapper = styled.div`
  position: sticky;
  bottom: 0;
  z-index: 900;
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background-color: ${({ theme }) => theme.color.white};
  border: 1px solid ${({ theme }) => theme.color.border};
  padding: 12px 20px;
`;

const StickyBarInner = styled.div`
  max-width: 250px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

export default StickyBar;
