// src/widgets/job-post-list/ui/JobPostList.styled.ts
import styled from 'styled-components';

export const ListContainer = styled.div`
  display: grid;
  // 3열 고정, 화면이 작아지면 비율대로 줄어듦
  grid-template-columns: repeat(3, 1fr); 
  gap: 24px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;

  /* 태블릿 환경 (2열) */
  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    grid-template-columns: repeat(2, 1fr);
  }

  /* 모바일 환경 (1열) */
  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    grid-template-columns: 1fr;
  }
`;

export const ObserverTarget = styled.div`
  height: 20px;
  grid-column: 1 / -1; // 그리드 전체 가로지르기
`;