import styled from 'styled-components';

const ResumeManagePage = () => {
  return (
    <ResumeManagePageStyle>
      <h1>이력서 관리</h1>
      <p>이력서를 작성하고 관리할 수 있습니다.</p>
    </ResumeManagePageStyle>
  );
};

const ResumeManagePageStyle = styled.div`
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

export default ResumeManagePage;
