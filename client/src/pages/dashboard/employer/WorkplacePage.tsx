import styled from 'styled-components';

const WorkplacePage = () => {
  return (
    <WorkplacePageStyle>
      <h1>작업장 관리</h1>
      <p>등록된 작업장을 관리할 수 있습니다.</p>
    </WorkplacePageStyle>
  );
};

const WorkplacePageStyle = styled.div`
  h1 {
    font-size: ${({ theme }) => theme.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    margin-bottom: 8px;
  }
  p {
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
  }
`;

export default WorkplacePage;
