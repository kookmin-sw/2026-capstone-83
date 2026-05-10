import styled from 'styled-components';

const SettingsPage = () => {
  return (
    <SettingsPageStyle>
      <h1>설정</h1>
      <p>계정 및 알림 설정을 관리할 수 있습니다.</p>
    </SettingsPageStyle>
  );
};

const SettingsPageStyle = styled.div`
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

export default SettingsPage;
