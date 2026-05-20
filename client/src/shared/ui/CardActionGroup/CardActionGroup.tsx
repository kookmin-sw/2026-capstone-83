import styled from 'styled-components';

/** 카드 제목 행 오른쪽 액션 버튼 묶음 */
export const CardActionGroup = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  white-space: nowrap;

  & > button {
    flex: 0 0 auto;
    width: auto;
    min-width: unset;
  }
`;
