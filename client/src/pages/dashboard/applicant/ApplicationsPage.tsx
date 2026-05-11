import styled from 'styled-components';

const ApplicationsPage = () => {
  return (
    <ApplicationsPageStyle>
      <h1>지원 이력</h1>
      <p>지원한 공고의 현황을 확인할 수 있습니다.</p>
    </ApplicationsPageStyle>
  );
};

const ApplicationsPageStyle = styled.div`
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

export default ApplicationsPage;
