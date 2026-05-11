import styled from 'styled-components';

const TalentPoolPage = () => {
  return (
    <TalentPoolPageStyle>
      <h1>인재풀</h1>
      <p>관심 인재를 관리할 수 있습니다.</p>
    </TalentPoolPageStyle>
  );
};

const TalentPoolPageStyle = styled.div`
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

export default TalentPoolPage;
