import { type ReactNode } from 'react'
import styled from 'styled-components'
import Title from '../Title/Title';
import type { FontSizeKey } from 'shared/types/theme';

interface Props {
  title?: string;
  titleSize?: FontSizeKey;
  action?: ReactNode; // 타이틀 우측에 들어갈 버튼이나 링크
  children: ReactNode;
}

const Section = ({ title, titleSize, action, children }: Props) => {
  return (
    <SectionStyle>
      {(title || action) && (
        <SectionHeader>
          {title && <Title fontSize={titleSize || 'large'}>{title}</Title>}
          {action && <div className="action-slot">{action}</div>}
        </SectionHeader>
      )}
      <div className="section-content">
        {children}
      </div>
    </SectionStyle>
  )
}

const SectionStyle = styled.section`
  padding: 40px;
  background: ${({ theme }) => theme.color.white}; /* 배경색 명시 */
  box-shadow: ${({ theme }) => theme.shadow.default};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  
  display: flex;
  flex-direction: column;
  gap: 24px; /* 타이틀과 콘텐츠 사이의 간격 */

  /* 모바일 대응 (선택) */
  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    padding: 24px;
    gap: 16px;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;


export default Section;