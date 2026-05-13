import styled from 'styled-components';

const ApplicantSettingsPage = () => {
  return (
    <S.PageWrapper>
      <h1>설정 (구직자)</h1>
      <p>계정, 알림, 프로필 설정을 관리할 수 있습니다.</p>
    </S.PageWrapper>
  );
};

const S = {
  PageWrapper: styled.div`
    h1 {
      font-size: ${({ theme }) => theme.fontSize.xlarge};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
      margin-bottom: 8px;
    }
    p {
      color: ${({ theme }) => theme.color.subText};
      font-size: ${({ theme }) => theme.fontSize.small};
    }
  `,
};

export default ApplicantSettingsPage;
