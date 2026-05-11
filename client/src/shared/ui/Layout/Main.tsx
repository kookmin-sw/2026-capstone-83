import { type ReactNode } from 'react'
import styled from 'styled-components'

interface Props {
  children: ReactNode;
}

const Main = ({ children }: Props) => {
  return (
    <MainStyle>
      {children}
    </MainStyle>
  )
}

const MainStyle = styled.main`
  /* 1. 페이지 중앙 정렬 및 최대 너비 설정 */
  max-width: 1200px; /* 프로젝트 디자인 가이드에 맞춰 조절 */
  margin: 0 auto;
  
  /* 2. 본문 기본 여백 */
  padding: 20px 20px;
  width: 100%;
  
  /* 3. 최소 높이 설정 (푸터가 바닥에 붙도록) */
  min-height: calc(100vh - 200px); /* GNB/푸터 높이를 제외한 나머지 */

  /* 모바일 대응 */
  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    padding: 20px 16px;
  }
`;

export default Main;