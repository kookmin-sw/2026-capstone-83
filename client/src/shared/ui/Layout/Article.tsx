import { type ReactNode } from 'react'
import styled from 'styled-components'

interface Props {
  children: ReactNode;
}

// 상세 페이지의 독립적인 정보 덩어리를 감싸는 컴포넌트
const Article = ({ children }: Props) => {
  return (
    <ArticleStyle>
      {children}
    </ArticleStyle>
  )
}

const ArticleStyle = styled.article`
  display: flex;
  flex-direction: column;
  gap: 32px; /* 섹션과 섹션 사이의 간격을 한 곳에서 관리! */
  width: 100%;
  
  padding-bottom: 80px; /* 하단 버튼 등에 가리지 않게 여유 공간 */
`;

export default Article;